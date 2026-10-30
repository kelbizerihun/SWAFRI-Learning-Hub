// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  Learning Hub Certificate Registry
 * @notice Anchors the SHA-256 fingerprint of every Learning Hub certificate on an
 *         EVM chain so anyone can verify it without contacting the issuer.
 *
 *         Only the fingerprint is stored (never the learner's name or score), so the
 *         chain holds no personal data. Verifiers recompute the fingerprint from the
 *         certificate details and compare it with what is stored here.
 */
contract CertificateRegistry {
    struct Certificate {
        bytes32 certHash;   // SHA-256 of the canonical certificate record
        address issuer;     // issuer account that anchored it
        address student;    // learner's wallet address
        uint64 issuedAt;    // block timestamp when anchored
        uint64 revokedAt;   // 0 while valid
    }

    address public owner;
    mapping(address => bool) public isIssuer;

    /// @dev keyed by keccak256(certId) so string IDs like "LH-2026-AB12CD" work as keys
    mapping(bytes32 => Certificate) private certificates;
    mapping(bytes32 => string) private revocationReasons;
    uint256 public totalIssued;
    uint256 public totalRevoked;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event IssuerUpdated(address indexed issuer, bool allowed);
    event CertificateIssued(bytes32 indexed idHash, string certId, bytes32 certHash, address indexed student, address indexed issuer);
    event CertificateRevoked(bytes32 indexed idHash, string certId, string reason, address indexed issuer);

    error NotOwner();
    error NotIssuer();
    error AlreadyIssued(string certId);
    error UnknownCertificate(string certId);
    error AlreadyRevoked(string certId);
    error EmptyHash();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert NotIssuer();
        _;
    }

    constructor() {
        owner = msg.sender;
        isIssuer[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
        emit IssuerUpdated(msg.sender, true);
    }

    // ---------------------------------------------------------------- admin

    function setIssuer(address account, bool allowed) external onlyOwner {
        isIssuer[account] = allowed;
        emit IssuerUpdated(account, allowed);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ---------------------------------------------------------------- issuing

    function issue(string calldata certId, bytes32 certHash, address student) external onlyIssuer {
        if (certHash == bytes32(0)) revert EmptyHash();
        bytes32 key = keccak256(bytes(certId));
        if (certificates[key].certHash != bytes32(0)) revert AlreadyIssued(certId);
        certificates[key] = Certificate(certHash, msg.sender, student, uint64(block.timestamp), 0);
        totalIssued++;
        emit CertificateIssued(key, certId, certHash, student, msg.sender);
    }

    function revoke(string calldata certId, string calldata reason) external onlyIssuer {
        bytes32 key = keccak256(bytes(certId));
        Certificate storage c = certificates[key];
        if (c.certHash == bytes32(0)) revert UnknownCertificate(certId);
        if (c.revokedAt != 0) revert AlreadyRevoked(certId);
        c.revokedAt = uint64(block.timestamp);
        revocationReasons[key] = reason;
        totalRevoked++;
        emit CertificateRevoked(key, certId, reason, msg.sender);
    }

    // ---------------------------------------------------------------- reading

    function getCertificate(string calldata certId)
        external
        view
        returns (bool exists, bytes32 certHash, address issuer, address student, uint64 issuedAt, uint64 revokedAt, string memory revokeReason)
    {
        bytes32 key = keccak256(bytes(certId));
        Certificate memory c = certificates[key];
        return (c.certHash != bytes32(0), c.certHash, c.issuer, c.student, c.issuedAt, c.revokedAt, revocationReasons[key]);
    }

    /// @notice One-call check for verifiers: does this fingerprint match, and is it still valid?
    function verify(string calldata certId, bytes32 certHash) external view returns (bool matches, bool revoked) {
        Certificate memory c = certificates[keccak256(bytes(certId))];
        return (c.certHash != bytes32(0) && c.certHash == certHash, c.revokedAt != 0);
    }
}
