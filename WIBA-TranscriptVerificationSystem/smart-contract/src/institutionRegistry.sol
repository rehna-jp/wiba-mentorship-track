// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract institutionRegistry {
    address public immutable admin;
    
    struct Institution {
        uint256 id;
        address walletAddress;
        string name;
        string country;
        string accreditedURL;
        bool isVerified;
        uint256 dateRegistered;
        string email;
    }
    
    mapping(address => Institution) public institutions;
    uint256 public numberOfInstitutions;
    uint256 public numberOfVerifiedInstitutions;

    event InstitutionRegistered(address indexed walletAddress, uint256 id);
    event InstitutionVerified(address indexed walletAddress);
    event InstitutionSuspended(address indexed walletAddress);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    error InstitutionAlreadyRegistered();
    error InstitutionAlreadyVerified();
    error InstitutionDoesNotExist();

    constructor(address _admin) {
        admin = _admin;
    }

    function registerInstitution(
        string calldata _name,
        string calldata _country,
        string calldata _accreditedURL,
        string calldata _email
    ) external {
        // Check if already registered (cheaper than storage read)
        if (institutions[msg.sender].walletAddress != address(0)) {
            revert InstitutionAlreadyRegistered();
        }
        
        // Use existing counter (no need for separate increment)
        uint256 newId = numberOfInstitutions + 1;
        numberOfInstitutions = newId;
        
        institutions[msg.sender] = Institution({
            id: newId,
            walletAddress: msg.sender,
            name: _name,
            country: _country,
            accreditedURL: _accreditedURL,
            isVerified: false,
            dateRegistered: block.timestamp,
            email: _email
        });

        // Emit minimal event data
        emit InstitutionRegistered(msg.sender, newId);
    }

    function verifyInstitution(address _institutionAddress) external onlyAdmin {
        Institution storage inst = institutions[_institutionAddress];
        if (inst.walletAddress == address(0)) revert InstitutionDoesNotExist();
        if (inst.isVerified) revert InstitutionAlreadyVerified();

        inst.isVerified = true;
        numberOfVerifiedInstitutions++;
        
        emit InstitutionVerified(_institutionAddress);
    }

    function suspendInstitution(address _institutionAddress) external onlyAdmin {
        Institution storage inst = institutions[_institutionAddress];
        if (inst.walletAddress == address(0)) revert InstitutionDoesNotExist();
        
        if (inst.isVerified) {
            inst.isVerified = false;
            numberOfVerifiedInstitutions--;
        }
        
        emit InstitutionSuspended(_institutionAddress);
    }

    function isInstitutionVerified(address _institutionAddress) external view returns (bool) {
        if (institutions[_institutionAddress].walletAddress == address(0)) {
            revert InstitutionDoesNotExist();
        }
        return institutions[_institutionAddress].isVerified;
    }

    function getInstitutionDetails(address _institutionAddress) external view returns(Institution memory) {
        if (institutions[_institutionAddress].walletAddress == address(0)) {
            revert InstitutionDoesNotExist();
        }
        return institutions[_institutionAddress];
    }
}