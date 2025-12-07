// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/institutionRegistry.sol";
import "../src/transcriptManager.sol";

contract InstitutionRegistryTest is Test {
    institutionRegistry public registry;
    address public admin;
    address public institution1;
    address public institution2;
    address public randomUser;

    // Events to test
    event InstitutionRegistered(address indexed _walletAddress, string _name, string _country, string _accreditedURL, string email);
    event InstitutionVerified(address indexed _walletAddress, string _name, string _country, string _accreditedURL, string email);
    event InstitutionSuspended(address indexed _walletAddress, string _name, string _country, string _accreditedURL, string email);

    function setUp() public {
        admin = makeAddr("admin");
        institution1 = makeAddr("institution1");
        institution2 = makeAddr("institution2");
        randomUser = makeAddr("randomUser");

        // Deploy registry as admin
        vm.prank(admin);
        registry = new institutionRegistry(admin);
    }

    /*//////////////////////////////////////////////////////////////
                         REGISTRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testRegisterInstitution() public {
        vm.startPrank(institution1);
        
        vm.expectEmit(true, false, false, true);
        emit InstitutionRegistered(
            institution1,
            "MIT",
            "USA",
            "https://whed.net/mit",
            "admin@mit.edu"
        );

        registry.registerInstitution(
            "MIT",
            "USA",
            "https://whed.net/mit",
            "admin@mit.edu"
        );

        vm.stopPrank();

        // Verify registration
        institutionRegistry.institution memory inst = registry.getInstitutionDetails(institution1);
        assertEq(inst.walletAddress, institution1);
        assertEq(inst.name, "MIT");
        assertEq(inst.country, "USA");
        assertEq(inst.accreditedURL, "https://whed.net/mit");
        assertEq(inst.email, "admin@mit.edu");
        assertEq(inst.isVerified, false);
        assertEq(registry.numberOfInstitutions(), 1);
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(institution1);
        
        registry.registerInstitution(
            "MIT",
            "USA",
            "https://whed.net/mit",
            "admin@mit.edu"
        );

        vm.expectRevert(institutionRegistry.InstitutionAlreadyRegistered.selector);
        registry.registerInstitution(
            "MIT Updated",
            "USA",
            "https://whed.net/mit",
            "admin@mit.edu"
        );

        vm.stopPrank();
    }

    function testMultipleInstitutionsCanRegister() public {
        // Institution 1 registers
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        // Institution 2 registers
        vm.prank(institution2);
        registry.registerInstitution("Stanford", "USA", "https://whed.net/stanford", "admin@stanford.edu");

        assertEq(registry.numberOfInstitutions(), 2);
    }

    /*//////////////////////////////////////////////////////////////
                         VERIFICATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testAdminCanVerifyInstitution() public {
        // Register institution
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        // Admin verifies
        vm.startPrank(admin);
        
        vm.expectEmit(true, false, false, true);
        emit InstitutionVerified(
            institution1,
            "MIT",
            "USA",
            "https://whed.net/mit",
            "admin@mit.edu"
        );

        registry.VerifyInstitution(institution1);
        vm.stopPrank();

        // Check verification
        assertTrue(registry.isInstitutionVerified(institution1));
        assertEq(registry.numberOfVerifiedInstitutions(), 1);
    }

    function testOnlyAdminCanVerify() public {
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        vm.prank(randomUser);
        vm.expectRevert("Only the admin can call this function");
        registry.VerifyInstitution(institution1);
    }

    function testCannotVerifyNonExistentInstitution() public {
        vm.prank(admin);
        vm.expectRevert(institutionRegistry.InstitutionDoesNotExist.selector);
        registry.VerifyInstitution(institution1);
    }

    function testCannotVerifyAlreadyVerifiedInstitution() public {
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        vm.startPrank(admin);
        registry.VerifyInstitution(institution1);

        vm.expectRevert(institutionRegistry.InstitutionAlreadyVerified.selector);
        registry.VerifyInstitution(institution1);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                         SUSPENSION TESTS
    //////////////////////////////////////////////////////////////*/

    function testAdminCanSuspendInstitution() public {
        // Register and verify
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        vm.startPrank(admin);
        registry.VerifyInstitution(institution1);

        // Suspend
        vm.expectEmit(true, false, false, true);
        emit InstitutionSuspended(
            institution1,
            "MIT",
            "USA",
            "https://whed.net/mit",
            "admin@mit.edu"
        );

        registry.suspendInstitution(institution1);
        vm.stopPrank();

        assertFalse(registry.isInstitutionVerified(institution1));
        assertEq(registry.numberOfVerifiedInstitutions(), 0);
    }

    function testOnlyAdminCanSuspend() public {
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        vm.prank(admin);
        registry.VerifyInstitution(institution1);

        vm.prank(randomUser);
        vm.expectRevert("Only the admin can call this function");
        registry.suspendInstitution(institution1);
    }

    /*//////////////////////////////////////////////////////////////
                         VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function testIsInstitutionVerified() public {
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        assertFalse(registry.isInstitutionVerified(institution1));

        vm.prank(admin);
        registry.VerifyInstitution(institution1);

        assertTrue(registry.isInstitutionVerified(institution1));
    }

    function testGetInstitutionDetails() public {
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        institutionRegistry.institution memory inst = registry.getInstitutionDetails(institution1);
        
        assertEq(inst.id, 1);
        assertEq(inst.walletAddress, institution1);
        assertEq(inst.name, "MIT");
        assertEq(inst.country, "USA");
        assertEq(inst.accreditedURL, "https://whed.net/mit");
        assertEq(inst.email, "admin@mit.edu");
        assertEq(inst.isVerified, false);
        assertGt(inst.dateRegistered, 0);
    }

    function testCannotGetDetailsOfNonExistentInstitution() public {
        vm.expectRevert(institutionRegistry.InstitutionDoesNotExist.selector);
        registry.getInstitutionDetails(institution1);
    }

    /*//////////////////////////////////////////////////////////////
                         EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function testEmptyStringsInRegistration() public {
        vm.prank(institution1);
        registry.registerInstitution("", "", "", "");

        institutionRegistry.institution memory inst = registry.getInstitutionDetails(institution1);
        assertEq(inst.name, "");
        assertEq(inst.country, "");
    }

    function testVerifyMultipleInstitutions() public {
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        vm.prank(institution2);
        registry.registerInstitution("Stanford", "USA", "https://whed.net/stanford", "admin@stanford.edu");

        vm.startPrank(admin);
        registry.VerifyInstitution(institution1);
        registry.VerifyInstitution(institution2);
        vm.stopPrank();

        assertEq(registry.numberOfVerifiedInstitutions(), 2);
        assertTrue(registry.isInstitutionVerified(institution1));
        assertTrue(registry.isInstitutionVerified(institution2));
    }
}


/*//////////////////////////////////////////////////////////////
                    TRANSCRIPT MANAGER TESTS
//////////////////////////////////////////////////////////////*/

contract TranscriptManagerTest is Test {
    institutionRegistry public registry;
    TranscriptManager public transcriptManager;
    
    address public admin;
    address public institution1;
    address public institution2;
    address public student1;
    address public student2;
    address public randomUser;

    // Events
    event TranscriptIssued(address indexed studentAddress, string ipfsCid, uint256 dateissued, address issuedby);
    event TranscriptInvalidated(address indexed studentAddress, uint256 dateissued, address issuedby);

    function setUp() public {
        admin = makeAddr("admin");
        institution1 = makeAddr("institution1");
        institution2 = makeAddr("institution2");
        student1 = makeAddr("student1");
        student2 = makeAddr("student2");
        randomUser = makeAddr("randomUser");

        // Deploy contracts
        vm.prank(admin);
        registry = new institutionRegistry(admin);

        transcriptManager = new TranscriptManager(address(registry));

        // Register and verify institution1
        vm.prank(institution1);
        registry.registerInstitution("MIT", "USA", "https://whed.net/mit", "admin@mit.edu");

        vm.prank(admin);
        registry.VerifyInstitution(institution1);
    }

    /*//////////////////////////////////////////////////////////////
                         ISSUANCE TESTS
    //////////////////////////////////////////////////////////////*/

    function testIssueTranscript() public {
        bytes32 docHash = keccak256("Sample Document Content");
        string memory cid = "QmTest123456789";

        vm.startPrank(institution1);
        
        vm.expectEmit(true, false, false, true);
        emit TranscriptIssued(student1, cid, block.timestamp, institution1);

        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        vm.stopPrank();

        // Verify transcript was issued
        TranscriptManager.Transcript memory transcript = transcriptManager.verifyTranscript(cid);
        assertEq(transcript.id, 1);
        assertEq(transcript.studentId, "STU001");
        assertEq(transcript.issuedBy, institution1);
        assertEq(transcript.documenthash, docHash);
        assertEq(uint(transcript.degreeType), uint(TranscriptManager.degreeType.BACHELOR));
        assertEq(transcript.studentAddress, student1);
        assertEq(transcript.graduationyear, 2024);
        assertEq(uint(transcript.status), uint(TranscriptManager.status.ACTIVE));
    }

    function testOnlyVerifiedInstitutionCanIssue() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.prank(randomUser);
        vm.expectRevert(abi.encodeWithSelector(institutionRegistry.InstitutionDoesNotExist.selector));
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );
    }

    function testUnverifiedInstitutionCannotIssue() public {
        // Register but don't verify institution2
        vm.prank(institution2);
        registry.registerInstitution("Stanford", "USA", "https://whed.net/stanford", "admin@stanford.edu");

        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.prank(institution2);
        vm.expectRevert("Only verified institutions can issue transcripts");
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );
    }

    function testCannotReuseCID() public {
        bytes32 docHash1 = keccak256("Document 1");
        bytes32 docHash2 = keccak256("Document 2");
        string memory cid = "QmTest123";

        vm.startPrank(institution1);
        
        // First issuance succeeds
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash1,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        // Second issuance with same CID fails
        vm.expectRevert("CID already used for another transcript");
        transcriptManager.issueTranscripts(
            "STU002",
            cid,
            docHash2,
            TranscriptManager.degreeType.MASTER,
            student2,
            2024
        );

        vm.stopPrank();
    }

    function testMultipleTranscriptsForSameStudent() public {
        bytes32 docHash1 = keccak256("Document 1");
        bytes32 docHash2 = keccak256("Document 2");

        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            "QmTest123",
            docHash1,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        transcriptManager.issueTranscripts(
            "STU001",
            "QmTest456",
            docHash2,
            TranscriptManager.degreeType.MASTER,
            student1,
            2026
        );

        vm.stopPrank();

        // Verify student has 2 transcripts
        TranscriptManager.Transcript[] memory transcripts = transcriptManager.getStudentTranscripts(student1);
        assertEq(transcripts.length, 2);
    }

    function testTranscriptCount() public {
        assertEq(transcriptManager.transcriptCount(), 0);

        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            "QmTest1",
            keccak256("Doc1"),
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        assertEq(transcriptManager.transcriptCount(), 1);

        transcriptManager.issueTranscripts(
            "STU002",
            "QmTest2",
            keccak256("Doc2"),
            TranscriptManager.degreeType.MASTER,
            student2,
            2024
        );

        assertEq(transcriptManager.transcriptCount(), 2);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                         VERIFICATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testVerifyTranscript() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.prank(institution1);
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        // Anyone can verify
        vm.prank(randomUser);
        TranscriptManager.Transcript memory transcript = transcriptManager.verifyTranscript(cid);
        
        assertEq(transcript.studentId, "STU001");
        assertEq(transcript.studentAddress, student1);
    }

    function testVerifyNonExistentTranscript() public {
        vm.expectRevert(TranscriptManager.TranscriptDoesNotExist.selector);
        transcriptManager.verifyTranscript("QmNonExistent");
    }

    function testVerifyRevokedTranscript() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        transcriptManager.inValidateTranscript(1);
        vm.stopPrank();

        vm.expectRevert(TranscriptManager.TranscriptDoesNotExist.selector);
        transcriptManager.verifyTranscript(cid);
    }

    /*//////////////////////////////////////////////////////////////
                         INVALIDATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testInvalidateTranscript() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        vm.expectEmit(true, false, false, true);
        emit TranscriptInvalidated(student1, block.timestamp, institution1);

        transcriptManager.inValidateTranscript(1);
        vm.stopPrank();

        // Verify cannot be verified anymore
        vm.expectRevert(TranscriptManager.TranscriptDoesNotExist.selector);
        transcriptManager.verifyTranscript(cid);
    }

    function testOnlyIssuerCanInvalidate() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.prank(institution1);
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        // Register and verify institution2
        vm.prank(institution2);
        registry.registerInstitution("Stanford", "USA", "https://whed.net/stanford", "admin@stanford.edu");
        vm.prank(admin);
        registry.VerifyInstitution(institution2);

        // Institution2 tries to invalidate institution1's transcript
        vm.prank(institution2);
        vm.expectRevert("Only the issuer can invalidate the transcript");
        transcriptManager.inValidateTranscript(1);
    }

    function testCannotInvalidateAlreadyInvalidated() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        transcriptManager.inValidateTranscript(1);

        vm.expectRevert("Transcript is already invalidated");
        transcriptManager.inValidateTranscript(1);
        
        vm.stopPrank();
    }

    function testCannotInvalidateNonExistentTranscript() public {
        vm.prank(institution1);
        vm.expectRevert("Transcript does not exist");
        transcriptManager.inValidateTranscript(999);
    }

    /*//////////////////////////////////////////////////////////////
                         GET DETAILS TESTS
    //////////////////////////////////////////////////////////////*/

    function testGetTranscriptDetails() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.prank(institution1);
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        TranscriptManager.Transcript memory transcript = transcriptManager.getTranscriptDetails(1);
        assertEq(transcript.studentId, "STU001");
        assertEq(transcript.ipfscid, cid);
    }

    function testCannotGetDetailsOfInvalidatedTranscript() public {
        bytes32 docHash = keccak256("Sample Document");
        string memory cid = "QmTest123";

        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        transcriptManager.inValidateTranscript(1);
        vm.stopPrank();

        vm.expectRevert("Transcript is invalidated");
        transcriptManager.getTranscriptDetails(1);
    }

    /*//////////////////////////////////////////////////////////////
                         STUDENT TRANSCRIPTS TESTS
    //////////////////////////////////////////////////////////////*/

    function testGetStudentTranscripts() public {
        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            "QmTest1",
            keccak256("Doc1"),
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        transcriptManager.issueTranscripts(
            "STU001",
            "QmTest2",
            keccak256("Doc2"),
            TranscriptManager.degreeType.MASTER,
            student1,
            2026
        );

        vm.stopPrank();

        TranscriptManager.Transcript[] memory transcripts = transcriptManager.getStudentTranscripts(student1);
        assertEq(transcripts.length, 2);
        assertEq(transcripts[0].ipfscid, "QmTest1");
        assertEq(transcripts[1].ipfscid, "QmTest2");
    }

    function testGetStudentTranscriptsEmpty() public {
        TranscriptManager.Transcript[] memory transcripts = transcriptManager.getStudentTranscripts(student1);
        assertEq(transcripts.length, 0);
    }

    function testGetStudentTranscriptsIncludesInvalidated() public {
        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts(
            "STU001",
            "QmTest1",
            keccak256("Doc1"),
            TranscriptManager.degreeType.BACHELOR,
            student1,
            2024
        );

        transcriptManager.inValidateTranscript(1);
        vm.stopPrank();

        TranscriptManager.Transcript[] memory transcripts = transcriptManager.getStudentTranscripts(student1);
        assertEq(transcripts.length, 1);
        assertEq(uint(transcripts[0].status), uint(TranscriptManager.status.REVOKED));
    }

    /*//////////////////////////////////////////////////////////////
                         DEGREE TYPE TESTS
    //////////////////////////////////////////////////////////////*/

    function testAllDegreeTypes() public {
        vm.startPrank(institution1);
        
        transcriptManager.issueTranscripts("STU001", "QmAssociate", keccak256("Doc1"), TranscriptManager.degreeType.ASSOCIATE, student1, 2024);
        transcriptManager.issueTranscripts("STU002", "QmBachelor", keccak256("Doc2"), TranscriptManager.degreeType.BACHELOR, student1, 2024);
        transcriptManager.issueTranscripts("STU003", "QmMaster", keccak256("Doc3"), TranscriptManager.degreeType.MASTER, student1, 2024);
        transcriptManager.issueTranscripts("STU004", "QmDoctorate", keccak256("Doc4"), TranscriptManager.degreeType.DOCTORATE, student1, 2024);
        transcriptManager.issueTranscripts("STU005", "QmCertificate", keccak256("Doc5"), TranscriptManager.degreeType.CERTIFICATE, student1, 2024);
        transcriptManager.issueTranscripts("STU006", "QmDiploma", keccak256("Doc6"), TranscriptManager.degreeType.DIPLOMA, student1, 2024);
        transcriptManager.issueTranscripts("STU007", "QmPostDoc", keccak256("Doc7"), TranscriptManager.degreeType.POSTDOCTORATE, student1, 2024);

        vm.stopPrank();

        assertEq(transcriptManager.transcriptCount(), 7);
    }

    /*//////////////////////////////////////////////////////////////
                         INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testCompleteWorkflow() public {
        // 1. Register institution
        vm.prank(institution2);
        registry.registerInstitution("Stanford", "USA", "https://whed.net/stanford", "admin@stanford.edu");

        // 2. Verify institution
        vm.prank(admin);
        registry.VerifyInstitution(institution2);

        // 3. Issue transcript
        vm.startPrank(institution2);
        transcriptManager.issueTranscripts(
            "STU001",
            "QmStanfordTranscript",
            keccak256("Stanford Transcript"),
            TranscriptManager.degreeType.MASTER,
            student1,
            2024
        );
        vm.stopPrank();

        // 4. Verify transcript
        TranscriptManager.Transcript memory transcript = transcriptManager.verifyTranscript("QmStanfordTranscript");
        assertEq(transcript.issuedBy, institution2);

        // 5. Get student transcripts
        TranscriptManager.Transcript[] memory transcripts = transcriptManager.getStudentTranscripts(student1);
        assertEq(transcripts.length, 1);

        // 6. Suspend institution
        vm.prank(admin);
        registry.suspendInstitution(institution2);

        // 7. Transcript still verifiable even after institution suspended
        transcript = transcriptManager.verifyTranscript("QmStanfordTranscript");
        assertEq(transcript.issuedBy, institution2);

        // 8. But suspended institution cannot issue new transcripts
        vm.prank(institution2);
        vm.expectRevert("Only verified institutions can issue transcripts");
        transcriptManager.issueTranscripts(
            "STU002",
            "QmNewTranscript",
            keccak256("New Transcript"),
            TranscriptManager.degreeType.BACHELOR,
            student2,
            2024
        );
    }

    /*//////////////////////////////////////////////////////////////
                         FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzzIssueTranscript(
        string memory studentId,
        string memory cid,
        uint256 graduationYear
    ) public {
        vm.assume(bytes(cid).length > 0);
        vm.assume(graduationYear > 1900 && graduationYear < 3000);
        
        bytes32 docHash = keccak256(abi.encodePacked(studentId, cid));

        vm.prank(institution1);
        transcriptManager.issueTranscripts(
            studentId,
            cid,
            docHash,
            TranscriptManager.degreeType.BACHELOR,
            student1,
            graduationYear
        );

        TranscriptManager.Transcript memory transcript = transcriptManager.verifyTranscript(cid);
        assertEq(transcript.studentId, studentId);
        assertEq(transcript.graduationyear, graduationYear);
    }
}