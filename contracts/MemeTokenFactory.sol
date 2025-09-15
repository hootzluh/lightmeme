// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Minimal ERC20 implementation for launchpad deployments
/// @notice Self-contained ERC20 with fixed supply minted at construction
contract LightERC20 {
    // ERC20 events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ERC20 storage
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address initialOwner_
    ) {
        require(initialOwner_ != address(0), "Owner=0");
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _mint(initialOwner_, initialSupply_);
    }

    // ERC20 metadata
    function name() external view returns (string memory) { return _name; }
    function symbol() external view returns (string memory) { return _symbol; }
    function decimals() external view returns (uint8) { return _decimals; }

    // ERC20 core
    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= value, "ERC20: insufficient allowance");
            unchecked { allowance[from][msg.sender] = allowed - value; }
        }
        _transfer(from, to, value);
        return true;
    }

    // Internals
    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0) && to != address(0), "ERC20: zero address");
        uint256 fromBal = balanceOf[from];
        require(fromBal >= value, "ERC20: balance<value");
        unchecked {
            balanceOf[from] = fromBal - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0) && spender != address(0), "ERC20: zero address");
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0), "ERC20: mint to zero");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
}

/// @title Meme Token Factory
/// @notice Deploys LightERC20 tokens and indexes them for discovery
contract MemeTokenFactory {
    /// @dev Emitted on each token deployment
    event TokenCreated(
        address indexed token,
        address indexed owner,
        string name,
        string symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 index
    );

    address[] private _allTokens;
    mapping(address => address[]) private _ownerToTokens;
    mapping(address => address) public tokenToOwner; // token => owner
    mapping(address => bool) public isTokenFromFactory;

    /// @notice Deploy a new ERC20 token with fixed initial supply
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param decimals_ Token decimals (e.g., 18)
    /// @param initialSupply_ Initial supply in smallest units (respecting decimals)
    /// @param owner_ Recipient of initial supply; if zero, msg.sender is used
    function createToken(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_
    ) external returns (address token) {
        address finalOwner = owner_ == address(0) ? msg.sender : owner_;
        token = address(new LightERC20(name_, symbol_, decimals_, initialSupply_, finalOwner));

        isTokenFromFactory[token] = true;
        tokenToOwner[token] = finalOwner;
        _ownerToTokens[finalOwner].push(token);
        _allTokens.push(token);

        emit TokenCreated(
            token,
            finalOwner,
            name_,
            symbol_,
            decimals_,
            initialSupply_,
            _allTokens.length - 1
        );
    }

    /// @notice Total number of tokens created by the factory
    function allTokensLength() external view returns (uint256) {
        return _allTokens.length;
    }

    /// @notice Get token address by global index
    function tokenAt(uint256 index) external view returns (address) {
        require(index < _allTokens.length, "index oob");
        return _allTokens[index];
    }

    /// @notice Return all token addresses (use with care if many)
    function getAllTokens() external view returns (address[] memory) {
        return _allTokens;
    }

    /// @notice Paged list of tokens for efficient UIs
    function getTokens(uint256 offset, uint256 limit) external view returns (address[] memory page) {
        uint256 len = _allTokens.length;
        if (offset >= len) return new address[](0);
        uint256 end = offset + limit;
        if (end > len) end = len;
        uint256 n = end - offset;
        page = new address[](n);
        for (uint256 i = 0; i < n; i++) {
            page[i] = _allTokens[offset + i];
        }
    }

    /// @notice Tokens created for a specific owner
    function getTokensByOwner(address owner) external view returns (address[] memory) {
        return _ownerToTokens[owner];
    }
}
