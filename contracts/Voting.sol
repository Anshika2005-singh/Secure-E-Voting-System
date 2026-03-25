// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VoteChainIndia
 * @dev A production-grade smart contract for decentralized, tamper-proof e-voting.
 */
contract VoteChainIndia {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    address public admin;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;
    mapping(address => Voter) public voters;

    event Voted(address indexed voter, uint256 indexed candidateId, bytes32 indexed receiptHash);
    event CandidateRegistered(uint256 id, string name, string party);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerCandidate(string memory _name, string memory _party) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);
        emit CandidateRegistered(candidatesCount, _name, _party);
    }

    function authorizeVoter(address _voter) public onlyAdmin {
        voters[_voter].isRegistered = true;
    }

    /**
     * @dev Cast a vote for a candidate. Emits a Receipt Hash for auditability.
     */
    function vote(uint256 _candidateId) public {
        require(voters[msg.sender].isRegistered, "Voter is not authorized");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        // Generate a unique receipt hash for external audit
        bytes32 receiptHash = keccak256(abi.encodePacked(msg.sender, _candidateId, block.timestamp));
        
        emit Voted(msg.sender, _candidateId, receiptHash);
    }

    function getCandidate(uint256 _id) public view returns (Candidate memory) {
        return candidates[_id];
    }
}
