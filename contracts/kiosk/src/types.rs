use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Owner,
    Item(u32),
    Policy,
    ItemCount,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ListingItem {
    pub id: u32,
    pub title: String,
    pub price: i128,
    pub is_listed: bool,
    pub seller: Address,
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
}
