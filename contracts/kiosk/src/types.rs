use soroban_sdk::{contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Owner,
    Item(u32),
    DefaultPolicy,
    AssetPolicy(Address),
    ItemCount,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ItemStatus {
    Placed = 1,
    Listed = 2,
    Sold = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ListingItem {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub asset_type: String,
    pub asset_contract: Address,
    pub asset_amount: i128,
    pub payment_token: Address,
    pub price: i128,
    pub is_listed: bool,
    pub seller: Address,
    pub status: ItemStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpstreamSplit {
    pub recipient: Address,
    pub share_bps: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransferPolicy {
    /// Basis points for creator royalty (e.g. 500 = 5%)
    pub royalty_bps: u32,
    /// Recipient address for creator royalties
    pub royalty_recipient: Address,
    /// Minimum floor price allowed for listing (in stroops / base token units)
    pub min_floor_price: i128,
    /// Upstream recipients and their respective share basis points
    pub upstream_splits: Vec<UpstreamSplit>,
}
