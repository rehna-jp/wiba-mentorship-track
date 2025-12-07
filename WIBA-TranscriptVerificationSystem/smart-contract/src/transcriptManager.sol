// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {institutionRegistry} from './institutionRegistry.sol';

contract TranscriptManager {
    institutionRegistry public immutable registry;
    
    enum Status { ACTIVE, REVOKED }
    enum DegreeType { ASSOCIATE, BACHELOR, MASTER, DOCTORATE, CERTIFICATE, DIPLOMA, POSTDOCTORATE }

    struct Transcript {
        uint256 id;
        string studentId;   
        address issuedBy;
        bytes32 documentHash;
        DegreeType degreeType;
        uint256 dateIssued;
        string ipfsCid;
        address studentAddress;
        Status status;
        uint256 graduationYear;
    }

    uint256 public transcriptCount;

    mapping(uint256 => Transcript) public transcripts;
    mapping(string => bool) public existingCIDs;
    mapping(string => uint256) public cidToTranscriptId;
    mapping(address => uint256[]) public studentToTranscripts;

    event TranscriptIssued(address indexed studentAddress, uint256 indexed transcriptId, address indexed issuedBy);
    event TranscriptInvalidated(address indexed studentAddress, uint256 indexed transcriptId);

    modifier onlyVerifiedInstitution() {
        require(registry.isInstitutionVerified(msg.sender), "Only verified institutions");
        _;
    }

    error TranscriptDoesNotExist();
    error CIDAlreadyUsed();

    constructor(address _registryAddress) {
        registry = institutionRegistry(_registryAddress);
    }

    function issueTranscripts(
        string calldata _studentId,
        string calldata _cid,
        bytes32 _documentHash,
        DegreeType _degreeType,
        address _studentAddress,
        uint256 _graduationYear
    ) external onlyVerifiedInstitution {
        if (existingCIDs[_cid]) revert CIDAlreadyUsed();

        transcriptCount++;
        uint256 newTranscriptId = transcriptCount;

        transcripts[newTranscriptId] = Transcript({
            id: newTranscriptId,
            studentId: _studentId,
            issuedBy: msg.sender,
            documentHash: _documentHash,
            degreeType: _degreeType,
            dateIssued: block.timestamp,
            ipfsCid: _cid,
            studentAddress: _studentAddress,
            status: Status.ACTIVE,
            graduationYear: _graduationYear
        });

        existingCIDs[_cid] = true;
        cidToTranscriptId[_cid] = newTranscriptId;
        studentToTranscripts[_studentAddress].push(newTranscriptId);

        emit TranscriptIssued(_studentAddress, newTranscriptId, msg.sender);
    }

    function verifyTranscript(string calldata _cid) external view returns(Transcript memory) {
        uint256 id = cidToTranscriptId[_cid];
        if (id == 0 || transcripts[id].status != Status.ACTIVE) {
            revert TranscriptDoesNotExist();
        }
        return transcripts[id];
    }

    function inValidateTranscript(uint256 _transcriptId) external onlyVerifiedInstitution {
        Transcript storage transcript = transcripts[_transcriptId];
        
        require(transcript.studentAddress != address(0), "Transcript does not exist");
        require(transcript.issuedBy == msg.sender, "Only issuer can invalidate");
        require(transcript.status == Status.ACTIVE, "Transcript already invalidated");
        
        transcript.status = Status.REVOKED;
        emit TranscriptInvalidated(transcript.studentAddress, _transcriptId);
    }

    function getTranscriptDetails(uint256 _transcriptId) external view returns (Transcript memory) {
        require(transcripts[_transcriptId].status == Status.ACTIVE, "Transcript invalidated");
        return transcripts[_transcriptId];
    }

    function getStudentTranscripts(address _student) external view returns (Transcript[] memory) {
        uint256[] memory ids = studentToTranscripts[_student];
        Transcript[] memory result = new Transcript[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = transcripts[ids[i]];
        }
        return result;
    }
}