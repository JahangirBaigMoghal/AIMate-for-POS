# FoodHub Partner API Schema Catalog

This file lists every schema and its flattened fields. Full raw schemas are in `../normalized/schemas.jsonl` and `../raw/foodhub-openapi.json`.

## AdditionalDiscountsEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| deals | no | array<object> |  | {} |
| deals[].ref_id | no | string | Deal ID (controlled by partners) | {} |
| deals[].free_item_ids | no | array<object> | List of items (item_id and quantity) that the customer will receive for free as part of the deal. | {} |
| deals[].free_item_ids[].quantity | no | number | Quantity of the item | {} |
| deals[].free_item_ids[].item_id | no | number | Partner item ID | {} |
| deals[].buy_item_ids | no | array<object> | List of items (item_id and quantity) that the customer needs to purchase to qualify for the deal. | {} |
| deals[].buy_item_ids[].quantity | no | number | Quantity of the item | {} |
| deals[].buy_item_ids[].item_id | no | number | Partner item ID | {} |
| deals[].name | no | string | This refers to the name of the deal. | {} |
| deals[].type | no | string | This refers to the type of deal. | {} |
| deals[].line_item_deal_id | no | string | The ID of the line item deal.(controlled by Foodhub) | {} |
| deals[].amendment_details | no | array<object> | Amendments applied to this deal (same shape as order line item amendment_details). | {} |
| deals[].amendment_details[].quantity | no | number |  | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| deals[].amendment_details[].replacement_items | no | array<object> |  | {} |
| deals[].amendment_details[].replacement_items[].quantity | no | number |  | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| deals[].amendment_details[].replacement_items[].item_id | no | string |  | {} |
| deals[].amendment_details[].replacement_items[].price | no | number |  | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| deals[].amendment_details[].amendment_type | no | string | The type of amendment | {"enum":["REPLACE_ITEM","REMOVE_ITEM","UPDATE_ITEM"]} |
| deals[].amendment_details[].item_id | no | string | Partner deal id (ref_id) for this cart discount line. | {} |
| deals[].amendment_details[].price | no | number | Amount in lowest currency unit where applicable. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| deals[].amendment_details[].original_items | no | array<object> |  | {} |
| deals[].amendment_details[].original_items[].quantity | no | number |  | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| deals[].amendment_details[].original_items[].item_id | no | string |  | {} |
| deals[].amendment_details[].original_items[].price | no | number |  | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| deals[].value | no | number | The discount value of the deal applied to the order. | {} |

## assignDriverResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/DriverLocationEntity |  | {} |
| data | no | #/components/schemas/DriverLocationEntity |  | {} |

## BulkCreateCouponsRequest

Title: BulkCreateCouponsRequest

Required fields: `coupons`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| coupons | yes | array<#/components/schemas/CouponEntity> |  | {} |
| coupons[] | no | #/components/schemas/CouponEntity |  | {} |

## ChargesEntity

Required fields: `carry_bags`, `delivery_fee`, `service_fee`, `tax`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| surcharge | no | number | Surcharge Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| small_order_charge | no | number | Small order charge for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| delivery_fee | yes | number | Delivery Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| tip_for_restaurant | no | number | Tip for restaurant for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| vat | no | number | Total vat applied to this order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| service_fee | yes | number | Service fee for processing the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| other_charge | no | number | Other charge for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| tax | yes | number | Total tax applied to this order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| driver_tips | no | number | Driver tips for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| carry_bags | yes | number | Total charges applied to this order for carry bags | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| package_charge | no | number | Package charge Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |

## CouponBulkCreateResponse

Title: Coupon Bulk Create Response

Required fields: `body`, `outcome`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| body | yes | array<unknown> |  | {} |
| body[] | no | oneOf(object, object) |  | {} |
| outcome | yes | string |  | {"enum":["success"]} |

## CouponCreateResponse

Title: Coupon Create Response

Required fields: `body`, `outcome`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| body | yes | object |  | {} |
| body.code | yes | string |  | {} |
| body.skipped_items | no | array<object> |  | {} |
| body.skipped_items[].reason | yes | string |  | {} |
| body.skipped_items[].item_id | yes | array<string> |  | {} |
| body.skipped_items[].unresolved_addons | no | array<string> |  | {} |
| body.skipped_items[].unresolved_item_ids | no | array<string> |  | {} |
| body.skipped_items[].status | yes | string |  | {"enum":["skipped"]} |
| body.couponId | yes | number |  | {} |
| outcome | yes | string |  | {"enum":["success"]} |

## CouponEntity

Title: Coupon Entity

Required fields: `code`, `min_order`, `start_date`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| end_date | no | string | End date YYYY-MM-DD, or empty string for open-ended promos. | {} |
| coupon_items | no | array<object> |  | {} |
| coupon_items[].menu_price | no | integer | Item price, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| coupon_items[].quantity | no | number |  | {} |
| coupon_items[].item_id | yes | array<string> | Partner-controlled item identifiers (same strings as menu item partner_id for this store). Each ID that matches a published item creates one coupon item line. IDs with no match are omitted and listed in the create response. | {"uniqueItems":true} |
| coupon_items[].addons | no | array<string> | Optional partner addon identifiers (same strings as menu addon partner_id). If any listed addon cannot be resolved for this store, that coupon line is skipped and the create response reports the unresolved IDs. | {"uniqueItems":true} |
| coupon_items[].include_addons | no | boolean |  | {} |
| coupon_items[].is_free | no | boolean |  | {} |
| coupon_items[].offer_price | no | integer | Item price, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| amount | no | number | Fixed discount in lowest currency unit. Send `percent` or `amount` (at least one required). | {"minimum":0} |
| coupon_portal | no | string |  | {"enum":["FOODHUB","ALL"],"default":"ALL"} |
| code | yes | string |  | {"minLength":1} |
| is_free_delivery | no | boolean |  | {} |
| end_time | no | string | Same time format as other Partner API fields: empty for all-day, or 24-hour HH:MM / HH:MM:SS (e.g. 09:00:00). | {} |
| description | no | string |  | {} |
| number_of_uses | no | number |  | {"minimum":1} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| percent | no | number | Percentage discount (0–100). Send `percent` or `amount` (at least one required). | {"minimum":0,"maximum":100} |
| one_per_customer | no | boolean |  | {} |
| start_time | no | string | Same time format as other Partner API fields: empty for all-day, or 24-hour HH:MM / HH:MM:SS (e.g. 09:00:00). | {} |
| service_type | no | string |  | {} |
| is_expired | no | boolean | Must be explicitly true to mark as expired. | {"default":false} |
| maximum_discount_value | no | number |  | {"minimum":0} |
| is_public | no | boolean |  | {} |
| is_tax_waiver | no | boolean |  | {} |
| min_order | yes | number |  | {"minimum":0} |
| start_date | yes | string | Start date YYYY-MM-DD. | {} |

## couponListResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | array<#/components/schemas/CouponRowEntity> |  | {} |
| data[] | no | #/components/schemas/CouponRowEntity |  | {} |

## CouponRowEntity

Title: Coupon Row

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| end_date | no | string |  | {} |
| amount | no | number |  | {} |
| coupon_portal | no | string |  | {"enum":["FOODHUB","ALL"]} |
| code | no | string |  | {} |
| is_free_delivery | no | number |  | {} |
| end_time | no | string |  | {} |
| description | no | string |  | {} |
| created_at | no | string |  | {} |
| number_of_uses | no | number |  | {} |
| availability | no | array<string> |  | {} |
| percent | no | number |  | {} |
| one_per_customer | no | number |  | {} |
| coupon_type_id | no | number |  | {} |
| start_time | no | string |  | {} |
| service_type | no | string |  | {} |
| is_expired | no | number |  | {} |
| maximum_discount_value | no | number |  | {} |
| updated_at | no | string |  | {} |
| host | no | string |  | {} |
| is_public | no | number |  | {} |
| is_tax_waiver | no | number |  | {} |
| id | no | number |  | {} |
| min_order | no | number |  | {} |
| start_date | no | string |  | {} |

## CreateDealsRequest

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| $ | no | #/components/schemas/DealEntity |  | {} |

## CreateOrderEntity

Title: Create Order Entity

Required fields: `customer`, `external_reference_id`, `fulfillment_type`, `items`, `payment`, `placed_on`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| delivery | no | object |  | {} |
| delivery.notes | no | string | Delivery specific notes from the customer | {"maxLength":1024} |
| delivery.address | yes | object | The address where the order will be delivered | {} |
| delivery.address.area | no | string | Address Area | {} |
| delivery.address.formatted_address | no | string | The full address as a single-line formatted string | {} |
| delivery.address.flat_no | no | string | Flat Number | {} |
| delivery.address.unit_number | no | string | House/Building/Unit number | {} |
| delivery.address.address2 | no | string | Address Line 2 | {} |
| delivery.address.city | no | string | City | {} |
| delivery.address.address1 | no | string | Full address | {} |
| delivery.address.postcode | no | string | Address Postcode | {} |
| delivery.address.state | no | string | Address state | {} |
| delivery.address.type | yes | string | Type of the address | {"enum":["STREET_ADDRESS"]} |
| delivery.address.lat | no | number | Latitude | {"minimum":-90,"maximum":90} |
| delivery.address.long | no | number | Longitude | {"minimum":-180,"maximum":180} |
| delivery.type | yes | string | Delivery type for the order | {"enum":["DELIVERY_BY_RESTAURANT","DELIVERY_BY_COURIER"]} |
| notes | no | string | Any special notes for the order | {"maxLength":1024} |
| est_delivery_time | no | string | This is the estimated delivery time required for delivery orders | {"format":"date-time"} |
| external_reference_id | yes | string | This is order id for extenal partners | {} |
| source | no | string | This is the original source of the order | {} |
| pre_order_time | no | string | This is the pre order date time | {"format":"date-time"} |
| fulfillment_type | yes | string | Type of Fulfillment required | {"enum":["COLLECTION","DELIVERY","INSTORE"]} |
| aggregator_order_id | no | string | This is order id for Aggregators | {} |
| friendly_id | no | string | This is friendly order id for Aggregators | {} |
| est_pick_up_time | no | string | This is the estimated pickup time required for collection orders and instore orders | {"format":"date-time"} |
| placed_on | yes | string | This is the order placed date time | {"format":"date-time"} |
| payment | yes | object |  | {} |
| payment.total | yes | number | The total amount for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.payment_type | yes | string | Indicates the mode of the payment | {"enum":["CASH","CARD","ONLINE"]} |
| payment.charges | yes | object |  | {} |
| payment.charges.surcharge | no | number | Surcharge Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.small_order_charge | no | number | Small order charge for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.delivery_fee | no | number | Delivery Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.tip_for_restaurant | no | number | Tip for restaurant for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.carry_bags_charge | no | number | Total charges applied to this order for carry bags | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.service_fee | no | number | Service fee for processing the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.other_charge | no | number | Other charge for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.tax | yes | number | Total tax applied to this order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.driver_tips | no | number | Driver tips for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.package_charge | no | number | Package charge Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.discounts | no | array<object> |  | {} |
| payment.discounts[].discount_value | yes | number | Discount applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.discounts[].discount_percentage | no | number | Percentage of the discount applied on the order | {"minimum":0,"maximum":100,"multipleOf":1} |
| payment.discounts[].discount_type | yes | string | Type of the discount applied to the order | {"enum":["FIXED_AMOUNT","PERCENTAGE"]} |
| payment.subtotal | yes | number | The total excluding charges | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.payment_status | yes | string | Indicates payment status | {"enum":["PAID","UNPAID"]} |
| utensils | no | boolean | Informs the store to package utensils with this order | {} |
| items | yes | array<object> | List of items on the order | {} |
| items[].quantity | yes | number | The total quantity requested for this item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].notes | no | string | Any special notes specifically for the item | {"maxLength":1024} |
| items[].category_name | no | string | The category name of the item | {} |
| items[].addons | yes | array<object> | List of addons against the item | {} |
| items[].addons[].addons | no | array<object> | List of nested addons against the item | {} |
| items[].addons[].addons[].price | yes | number | Price of the Addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].addons[].addons[].name | yes | string | The title of the Addon | {} |
| items[].addons[].addons[].modifier_group_name | no | string | The title of the modifier group name | {} |
| items[].addons[].addons[].id | yes | string | Addon identifier | {} |
| items[].addons[].price | yes | number | Price of the Addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].addons[].name | yes | string | The title of the Addon | {} |
| items[].addons[].modifier_group_name | no | string | The title of the Addon | {} |
| items[].addons[].id | yes | string | Addon identifier | {} |
| items[].price | yes | number | Price of the item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].name | yes | string | The title of the item | {} |
| items[].id | yes | string | Order Item | {} |
| total_carry_bags | no | number | Indicates the total carry bags used for this order. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| customer | yes | object |  | {} |
| customer.phone | no | string | Phone number of the customer | {"maxLength":15} |
| customer.last_name | yes | string | Last name of the customer | {"minLength":1} |
| customer.first_name | yes | string | First name of the customer | {"minLength":1} |
| customer.email | no | string | Email of the customer | {"format":"email"} |
| customer.phone_code | no | string | The phone code to access the phone number | {"maxLength":12} |

## CreateOrderResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | object |  | {} |
| data.orderId | no | string | Order Identifier | {} |
| data.resourceUri | no | string | Resource Path | {} |
| data.storeId | no | string | Resource Identifier | {} |

## CustomerEntity

Required fields: `first_name`, `last_name`, `phone`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| phone | yes | string | Phone number of the customer | {"minLength":1} |
| last_name | yes | string | Last name of the customer | {"minLength":1} |
| id | no | string | Identifier that uniquely identifies the customer(only applicable for Foodhub orders) | {"minLength":1} |
| phone_pin | no | string | Phone pin of the customer (used with proxy numbers) | {} |
| first_name | yes | string | First name of the customer | {"minLength":1} |
| email | no | string | Email address of the customer | {"format":"email","minLength":1} |

## DealDiscountEntity

Required fields: `availability`, `id`, `items`, `schedule`, `subcategory_id`, `type`, `value`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| subcategory_id | yes | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| availability | yes | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | yes | string | Deals Type | {"enum":["flat","percent"]} |
| value | yes | number | Either Percent or Flat value | {} |
| items | yes | array<string> | Array of item ids | {} |

## DealEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| n_for_price_n | no | array<#/components/schemas/DealNForPriceNEntity> | A list of n_for_price_n promotions | {} |
| n_for_price_n[] | no | #/components/schemas/DealNForPriceNEntity |  | {} |
| discounts | no | array<#/components/schemas/DealDiscountEntity> | A list of flat and percent discounts | {} |
| discounts[] | no | #/components/schemas/DealDiscountEntity |  | {} |
| n_for_n | no | array<#/components/schemas/DealNForNEntity> | A list of n_for_n promotions | {} |
| n_for_n[] | no | #/components/schemas/DealNForNEntity |  | {} |
| meals | no | array<#/components/schemas/DealMealsEntity> | A list of type meals deals | {} |
| meals[] | no | #/components/schemas/DealMealsEntity |  | {} |

## DealGetDiscountEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| id | no | string | Deal ID (controlled by partners) | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | no | string | Deals Type | {"enum":["flat","percent"]} |
| value | no | number | Either Percent or Flat value | {} |
| items | no | array<string> | Array of item ids | {} |

## DealGetNForNEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| buy_qty | no | integer | Buy N Item. only for n-for-n and n-for-price-n types | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | no | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| free_qty | no | integer | Get Free N Item.only for n-for-n type | {} |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | no | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | no | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealGetNForPriceNEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| buy_qty | no | integer | Buy N Item. only for n-for-n and n-for-price-n types | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | no | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| free_qty | no | integer | Get Free N Item.only for n-for-n type | {} |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | no | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | no | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealMealsEntity

Required fields: `id`, `name`, `price`, `schedule`, `selections`, `subcategory_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | no | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| subcategory_id | yes | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | yes | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | yes | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | yes | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealNForNEntity

Required fields: `buy_qty`, `free_qty`, `id`, `name`, `schedule`, `selections`, `subcategory_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| buy_qty | yes | integer | Buy N Item. only for n-for-n and n-for-price-n types | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| free_qty | yes | integer | Get Free N Item.only for n-for-n type | {} |
| subcategory_id | yes | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | yes | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | yes | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealNForPriceNEntity

Required fields: `buy_qty`, `free_qty`, `id`, `name`, `price`, `schedule`, `selections`, `subcategory_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| buy_qty | yes | integer | Buy N Item. only for n-for-n and n-for-price-n types | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | no | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| free_qty | yes | integer | Get Free N Item.only for n-for-n type | {} |
| subcategory_id | yes | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | yes | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | yes | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | yes | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | yes | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealsEntity

Required fields: `id`, `type`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| name | no | string | Item Name | {} |
| description | no | string | Item Description | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | yes | string | Deals Type | {"enum":["flat","percent"]} |
| value | no | number | Either Percent or Flat value | {} |
| items | no | array<string> | Array of item ids | {} |

## DealsListResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | array<#/components/schemas/DealEntity> |  | {} |
| data[] | no | #/components/schemas/DealEntity |  | {} |

## DealsResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/DealEntity |  | {} |
| data | no | #/components/schemas/DealEntity |  | {} |

## DealUpdateMealEntity

Required fields: `id`, `type`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | yes | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | no | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealUpdateNForNEntity

Required fields: `id`, `type`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| buy_qty | no | integer | Buy N Item. only for n-for-n and n-for-price-n types | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | yes | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| free_qty | no | integer | Get Free N Item.only for n-for-n type | {} |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | no | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DealUpdateNForPriceNEntity

Required fields: `id`, `type`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| buy_qty | no | integer | Buy N Item. only for n-for-n and n-for-price-n types | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionTypeEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| type | yes | string | Deals Type | {"enum":["n-for-n","n-for-price-n","meals","flat","percent"]} |
| free_qty | no | integer | Get Free N Item.only for n-for-n type | {} |
| subcategory_id | no | string | Pass the ref id of subcategory it mapped with deals | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleDateTimeEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | no | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Deal Name | {} |
| tax_percentage | no | integer | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":1} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Deal ID (controlled by partners) | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## DeliveryInfoEntity

Required fields: `address`, `notes`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| address | yes | object | The address where the order will be delivered | {} |
| address.area | no | string | Address Area | {} |
| address.formatted_address | no | string | The full address as a single-line formatted string | {} |
| address.flat_no | no | string | Flat number (if applicable) | {} |
| address.address2 | no | string | Address Line 2 | {} |
| address.city | no | string | Address City | {} |
| address.address1 | no | string | Address Line 1 | {} |
| address.house_no | no | string | House number (if applicable) | {} |
| address.postcode | no | string | Address Postcode | {} |
| address.lon | no | string | Longitude | {} |
| address.lat | no | string | Latitude | {} |
| notes | yes | string | Delivery specific notes from the customer | {} |
| driver | no | object |  | {} |
| driver.photo | no | string | A URL to an image of the driver | {} |
| driver.lon | no | string | Drivers Longitude coordinate | {} |
| driver.id | yes | string | A unique value that identifies the driver delivering the order | {} |
| driver.display_name | yes | string | Drivers display name | {} |
| driver.lat | no | string | Drivers Latitude coordinate | {} |
| est_dropoff | no | string | This value will be populated when the order is Delivery | {} |

## DietaryLabelsEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |

## discountResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/DealGetDiscountEntity |  | {} |
| data | no | #/components/schemas/DealGetDiscountEntity |  | {} |

## DiscountsEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| points_gained | no | number | Loyalty Points gained for the order | {} |
| coupon_code | no | string | Coupon Code applied to the order | {} |
| points_used | no | number | Loyalty Points Used for the order | {} |
| discount_code | no | string | Discount Code applied to the order | {} |
| discount_percentage | no | number | Discount value applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| coupon_value | no | number | Coupon Value applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| collection_discount_value | no | number | Collection Discount Value applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| redeem_amount | no | number | Amount Redeemed from Loyalty Points for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| additional_discounts | no | #/components/schemas/AdditionalDiscountsEntity |  | {} |
| additional_discounts | no | #/components/schemas/AdditionalDiscountsEntity |  | {} |
| points_remaining | no | number | Total Loyalty Points Remaining | {} |
| online_discount_value | no | number | Online Discount Value applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| cash_discount_value | no | number | Cash Discount Value applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| coupon_type | no | string | Coupon Type applied to the order | {} |

## DriverLocationEntity

Title: Driver Location Entity

Required fields: `external_driver_id`, `first_name`, `phone`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| phone | yes | string | Phone Number of the driver | {} |
| last_name | no | string | Last Name of the driver | {} |
| external_driver_id | yes | string | Identifier that uniquely identifies the driver | {} |
| first_name | yes | string | First Name of the driver | {} |
| lat | no | number | Current Latitude of the driver location | {"minimum":-90,"maximum":90} |
| long | no | number | Current Longitude of the driver location | {"minimum":-180,"maximum":180} |
| status | no | string | When a driver is assigned for the first time, the system sets the 'ASSIGNED' status automatically. Subsequent real-time driver updates can be provided as needed. | {"enum":["ENROUTE_TO_PICKUP","PICKUP_ARRIVED","PICKUP_COMPLETE","ENROUTE_TO_DROPOFF","DROPOFF_ARRIVED","DROPOFF_COMPLETE"]} |

## Empty

Title: Empty Schema

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |

## EntityCreateEvent

Title: Entity Create Event

Event is triggered when a single item or modifier is created

Required fields: `event_type`, `resource_href`, `entity_type`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when a single item or modifier is created | {"enum":["ENTITY_CREATE"]} |
| entity_type | yes | string | Type of the entity, Example : item or modifier | {} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## EntityDeleteEvent

Title: Entity Delete Event

Event is triggered when a single item or modifier is deleted

Required fields: `event_type`, `resource_href`, `entity_type`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when a single item or modifier is deleted | {"enum":["ENTITY_DELETE"]} |
| entity_type | yes | string | Type of the entity, Example : item or modifier | {} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## EntityStockStatusUpdateEvent

Title: Entity stock status update event

Event is triggered when the stock status of an entity in the menu is updated

Required fields: `entity_type`, `entity_id`, `status`, `event_type`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| event_type | yes | string | Event is triggered when the stock status of an entity in the menu is updated | {"enum":["ENTITY_STOCK_STATUS_UPDATE"]} |
| entity_type | yes | string | Type of the entity, Example : item or modifier | {} |
| event_id | yes | string | Unique Event Identifier | {} |
| entity_id | yes | string | The id for the entity of which the stock status is getting updated | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |
| status | yes | string | The stock status of the entity | {"enum":["AVAILABLE","UNAVAILABLE"]} |

## EntityUpdateEvent

Title: Entity Update Event

Event is triggered when a single item is updated

Required fields: `event_type`, `resource_href`, `entity_type`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when a single item or modifier is updated | {"enum":["ENTITY_UPDATE"]} |
| entity_type | yes | string | Type of the entity, Example : item or modifier | {} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## ErrorResponse400

Title: Error Response

Required fields: `error`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| error | yes | string | 400 Bad Request is the status code that indicates the server cannot or will not process the request due to something that is perceived to be a client error | {} |

## ErrorResponse401

Title: Error Response

Required fields: `error`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| error | yes | string | 401 Unauthorized is the status code to return when the client provides no credentials or invalid credentials. | {} |

## ErrorResponse403

Title: Error Response

Required fields: `error`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| error | yes | string | 403 Forbidden is the status code to return when a client has valid credentials but not enough privileges to perform an action on a resource. | {} |

## ErrorResponse404

Title: Error Response

Required fields: `error`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| error | yes | string | 404 Not Found is the status code that indicates a server could not find a client-requested webpage | {} |

## ErrorResponse409

Title: Error Response

Required fields: `error`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| error | yes | string | 409 Conflict is the status code that indicates a request could not be completed due to a conflict with the current state of the resource | {} |

## ErrorResponse429

Title: Error Response

Required fields: `error`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| error | yes | string | 429 Too Many Requests is the status code that indicates the client application has surpassed its rate limit, or number of requests they can send in a given period of time | {} |

## KitchenSectionEntity

Title: Kitchen Section Entity

Required fields: `name`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| name | yes | string | Section Name | {"minLength":1} |

## kitchenSectionResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | array<unknown> |  | {} |
| data[] | no | allOf(#/components/schemas/KitchenSectionEntity, object) |  | {} |

## ListOrdersResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | array<#/components/schemas/OrderHeaderEntity> |  | {} |
| data[] | no | #/components/schemas/OrderHeaderEntity |  | {} |

## LongLatPoint

Title: A longitude, latitude point

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |

## mealsResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/DealGetDiscountEntity |  | {} |
| data | no | #/components/schemas/DealGetDiscountEntity |  | {} |

## MenuCategoryEntity

Required fields: `id`, `is_tax_included`, `name`, `subcategories`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| image | no | string | Image that should be displayed along side this category. If the field is missing - any existing image will be removed. | {} |
| name_localized | no | string | Second Language Name | {} |
| service_availability | no | array<#/components/schemas/ServiceAvailabilityEntity> | [Menu V4 only] Service availability details for the menu. Not supported in Menu V3 and below.. | {} |
| service_availability[] | no | #/components/schemas/ServiceAvailabilityEntity |  | {} |
| availability | no | array<string> | An array containing the days of the week this category should be shown | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| expand_subcategories | no | boolean | If true, subcategories will be expanded and shown directly at the top level, without requiring the user to click on the category to see the list of subcategories. | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| sequence | no | integer | The sequence field orders categories for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| kitchen_sections | no | array<string> | A list of unique kitchen section identifiers assigned to this category | {"uniqueItems":true} |
| fulfillment_modes | no | array<string> | An array containing the possible fulfillment modes | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| name | yes | string | Category Name | {"minLength":1} |
| tax_percentage | no | number | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":0.0001} |
| id | yes | string | Category ID (controlled by partners) | {} |
| is_tax_included | yes | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |
| subcategories | yes | array<string> | An array of subcategory ids that should be show under this category | {"uniqueItems":true} |

## MenuCategoryPutEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| image | no | string | Image that should be displayed along side this category. If the field is missing - any existing image will be removed. | {} |
| kitchen_sections | no | array<string> | A list of unique kitchen section identifiers assigned to this category | {"uniqueItems":true} |
| name_localized | no | string | Second Language Name | {} |
| fulfillment_modes | no | array<string> | An array containing the possible fulfillment modes | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| name | no | string | Category Name | {"minLength":1} |
| tax_percentage | no | number | This is to capture the tax percentage in both the cases of is_tax_included true or false. | {"minimum":0,"maximum":100,"multipleOf":0.0001} |
| availability | no | array<string> | An array containing the days of the week this category should be shown | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |
| expand_subcategories | no | boolean | If true, subcategories will be expanded and shown directly at the top level, without requiring the user to click on the category to see the list of subcategories. | {} |

## menuCategoryResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/MenuCategoryEntity |  | {} |
| data | no | #/components/schemas/MenuCategoryEntity |  | {} |

## MenuEntityModel

Required fields: `categories`, `items`, `modifier_groups`, `modifiers`, `subcategories`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| modifier_groups | yes | array<#/components/schemas/MenuModifierGroupEntity> | A list of modifier groups and the relationships to modifiers | {} |
| modifier_groups[] | no | #/components/schemas/MenuModifierGroupEntity |  | {} |
| menus | no | array<#/components/schemas/MultipleMenuEntity> | A list of multiple menu. | {} |
| menus[] | no | #/components/schemas/MultipleMenuEntity |  | {} |
| categories | yes | array<#/components/schemas/MenuCategoryEntity> | A list of top level categories and the relationships to subcateogries | {} |
| categories[] | no | #/components/schemas/MenuCategoryEntity |  | {} |
| subcategories | yes | array<#/components/schemas/MenuSubCategoryEntity> | A list of subcategories and the relationships to items | {} |
| subcategories[] | no | #/components/schemas/MenuSubCategoryEntity |  | {} |
| modifiers | yes | array<#/components/schemas/MenuModifierEntity> | A list of modifiers that can be used by modifier groups | {} |
| modifiers[] | no | #/components/schemas/MenuModifierEntity |  | {} |
| items | yes | array<#/components/schemas/MenuItemEntity> | A list of items and the relationships to any modifer groups | {} |
| items[] | no | #/components/schemas/MenuItemEntity |  | {} |

## MenuImageProcessingErrorEvent

Title: Order image Processing Error Event

Event is triggered when an image processing error occurs with a menu item

Required fields: `event_type`, `image`, `reason`, `entity_type`, `entity_id`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| image | yes | string | Image that was processed | {} |
| reason | yes | string | Example: Image is too large or invalid | {} |
| event_type | yes | string |  | {"enum":["MENU_IMAGE_PROCESSING_ERROR"]} |
| entity_type | yes | string | Example: item for MenuItem | {} |
| event_id | yes | string | Unique Event Identifier | {} |
| entity_id | yes | string | The id for the menu item of which the failed image is associated with | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## MenuItemEntity

Required fields: `id`, `is_tax_included`, `name`, `price`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| inherit_sections | no | boolean | If true, the item will inherit kitchen sections from its parent — but only if kitchen_sections is not set | {"default":false} |
| offer | no | string | Offer Type | {"enum":["BOGOF","BOGOH"]} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| kitchen_sections | no | array<string> | A list of unique kitchen section identifiers assigned to this item. This field takes precedence over inheritance — if provided, it will override any parent section mapping. | {"uniqueItems":true} |
| min_permitted | no | integer | Minimum number of items that must be selected (inclusive) | {"minimum":0} |
| fulfillment_modes | no | array<string> |  | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| price | yes | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| id | yes | string | Item ID (controlled by partners) | {} |
| is_tax_included | yes | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |
| barcode | no | string | Barcode of the item | {} |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| image | no | string | Image that should be displayed along side this item. If the field is missing - any existing image will be removed. | {} |
| max_permitted | no | integer | Maximum number of items that must be selected (inclusive) | {} |
| service_availability | no | array<#/components/schemas/ServiceAvailabilityEntity> | [Menu V4 only] Service availability details for the menu. Not supported in Menu V3 and below.. | {} |
| service_availability[] | no | #/components/schemas/ServiceAvailabilityEntity |  | {} |
| modifier_groups | no | array<string> |  | {"uniqueItems":true} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| selections | no | array<object> |  | {} |
| selections[].modifier_group_id | yes | string | Modifier Group reference ID | {} |
| selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers | yes | array<object> |  | {} |
| selections[].modifiers[].show_online | no | boolean | Show the modifier online or not praticular item | {} |
| selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifier groups | {} |
| selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].price | no | integer | Override price for the modifier, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| selections[].modifiers[].modifier_id | yes | string | Modifier reference ID | {} |
| name | yes | string | Item Name | {} |
| tax_percentage | no | number | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":0.0001} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| restriction_tag | no | string | Restriction tag of an item | {} |

## MenuItemGetEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| $ | no | allOf(object, #/components/schemas/MenuItemUpdateEntity) |  | {} |

## MenuItemResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/MenuItemGetEntity |  | {} |
| data | no | #/components/schemas/MenuItemGetEntity |  | {} |

## MenuItemUpdateEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| image | no | string | Image that should be displayed along side this item. | {} |
| number_of_servings | no | number | Describes the Number of servings for a item | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| max_permitted | no | integer | Maximum number of items that must be selected (inclusive) | {} |
| modifier_groups | no | array<string> |  | {"uniqueItems":true} |
| description | no | string | Item Description | {} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| availability | no | array<string> |  | {"uniqueItems":true} |
| inherit_sections | no | boolean | If true, the item will inherit kitchen sections from its parent — but only if kitchen_sections is not set | {"default":false} |
| offer | no | string | Offer Type | {"enum":["BOGOF","BOGOH"]} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| sequence | no | integer | The sequence field orders items for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| kitchen_sections | no | array<string> | A list of unique kitchen section identifiers assigned to this item. This field takes precedence over inheritance — if provided, it will override any parent section mapping. | {"uniqueItems":true} |
| min_permitted | no | integer | Minimum number of items that must be selected (inclusive) | {"minimum":0} |
| fulfillment_modes | no | array<string> |  | {"uniqueItems":true} |
| price | no | integer | Menu item price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Item Name | {} |
| tax_percentage | no | number | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":0.0001} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |
| restriction_tag | no | string | Restriction tag of an item | {} |

## MenuModifierEntity

Required fields: `id`, `is_tax_included`, `name`, `price`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| image | no | string | Image that should be displayed along side this modifier. If the field is missing - any existing image will be removed. | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| pre_selected | no | string | Enable to set this modifier as default. | {"enum":["YES","NO"]} |
| max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| modifier_groups | no | array<string> |  | {"uniqueItems":true} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| offer | no | string | Offer Type | {"enum":["BOGOF","BOGOH"]} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders addons for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| price_for_half | no | integer | Item Modifier custom price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. Only applicable for Half_N_Half modifiers | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| kitchen_sections | no | array<string> | A list of unique kitchen section identifiers assigned to this modifier. This field takes precedence over inheritance — if provided, it will override any parent section mapping. | {"uniqueItems":true} |
| min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| price | yes | integer | Item Modifier price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | yes | string | Modifier Name | {} |
| tax_percentage | no | number | This will only work when tax included is false. | {"minimum":0,"maximum":99,"multipleOf":0.0001} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| id | yes | string | Modifier ID (controlled by partners) | {} |
| is_tax_included | yes | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## MenuModifierGetEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| $ | no | allOf(object, #/components/schemas/MenuModifierUpdateEntity) |  | {} |

## MenuModifierGroupEntity

Required fields: `id`, `modifiers`, `name`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| sequence | no | integer | The sequence field orders modifier groups for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| name_localized | no | string | Second Language Name | {} |
| min_permitted | no | number | Minimum quantity allowed (inclusive) -- Cannot be negative. | {"minimum":0,"multipleOf":1} |
| max_permitted | no | number | Maximum quantity allowed (inclusive).<br><br>max_permitted cannot be less than min_permitted. | {"minimum":0,"multipleOf":1} |
| name | yes | string | Modifier Group Name | {} |
| description | no | string |  | {} |
| id | yes | string | Modifier Group ID (controlled by partners) | {} |
| modifiers | yes | array<string> |  | {} |
| type | no | string | Defines the Half_N_Half type for the Modifier Group. When specified, modifiers will be categorized as left, whole, or right side options. | {"enum":["HALF_N_HALF","NONE"],"default":"NONE"} |

## menuModifierGroupResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/MenuModifierGroupEntity |  | {} |
| data | no | #/components/schemas/MenuModifierGroupEntity |  | {} |

## MenuModifierResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/MenuModifierGetEntity |  | {} |
| data | no | #/components/schemas/MenuModifierGetEntity |  | {} |

## MenuModifierUpdateEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| image | no | string | Image that should be displayed along side this modifier. | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| nutrition_info | no | #/components/schemas/NutritionInfoEntity |  | {} |
| name_localized | no | string | Second Language Name | {} |
| pre_selected | no | string | Enable preselected modifier | {"enum":["YES","NO"]} |
| contains_tobacco | no | boolean | This is to specify if the item contains tobacco content or not | {} |
| offer | no | string | Offer Type | {"enum":["BOGOF","BOGOH"]} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| contains_alcohol | no | boolean | This is to specify if the item contains alcohol content or not | {} |
| sequence | no | integer | The sequence field orders addons for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| price_for_half | no | integer | Item Modifier custom price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. Only applicable for Half_N_Half modifiers | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| price | no | integer | Item Modifier price value, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | Modifier Name | {} |
| tax_percentage | no | number | This will only work when tax included is false. | {"minimum":0,"maximum":99,"multipleOf":0.0001} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| dietary_labels | no | #/components/schemas/DietaryLabelsEntity |  | {} |
| is_tax_included | no | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |

## MenuProcessingCompletedStatus

Title: Menu Processing Completed Status

Event is triggered when a menu processing gets success or failed.

Required fields: `event_type`, `reason`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| reason | yes | string | Example: Failures While Processing very large menus | {} |
| event_type | yes | string |  | {"enum":["MENU_PUBLISH_STATUS_EVENT"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |
| status | no | string | Example: Success or Failed | {"enum":["SUCCESS","PENDING","FAILED"]} |

## MenuResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/MenuEntityModel |  | {} |
| data | no | #/components/schemas/MenuEntityModel |  | {} |

## MenuSubCategoryEntity

Required fields: `id`, `is_tax_included`, `items`, `name`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| image | no | string | Image that should be displayed along side this subcategory. If the field is missing - any existing image will be removed. | {} |
| name_localized | no | string | Second Language Name | {} |
| service_availability | no | array<#/components/schemas/ServiceAvailabilityEntity> | [Menu V4 only] Service availability details for the menu. Not supported in Menu V3 and below.. | {} |
| service_availability[] | no | #/components/schemas/ServiceAvailabilityEntity |  | {} |
| description | no | string |  | {} |
| availability | no | array<string> | An array containing the days of hte week this subcategory should be shown | {"default":["MO","TU","WE","TH","FR","SA","SU"],"uniqueItems":true} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| schedule | no | #/components/schemas/ScheduleEntity |  | {} |
| show_online | no | boolean | Enable or Disable whether this category shown on Foodhub platform. | {} |
| sequence | no | integer | The sequence field orders subcategories for display or application. It's a numeric value indicating the preferred order, with lower values shown first. | {"default":0} |
| kitchen_sections | no | array<string> | A list of unique kitchen section identifiers assigned to this subcategory. This field takes precedence over inheritance — if provided, it will override any parent section mapping. | {"uniqueItems":true} |
| fulfillment_modes | no | array<string> | An array containing the possible fulfillment modes | {"default":["DELIVERY","COLLECTION"],"uniqueItems":true} |
| name | yes | string | Subcategory Name | {} |
| tax_percentage | no | number | This will only work when tax included is false. | {"minimum":0,"maximum":100,"multipleOf":0.0001} |
| id | yes | string | Subcategory ID (controlled by partners) | {} |
| is_tax_included | yes | boolean | Setting to true assumes tax is included in the price. Otherwise you will be able to set tax_percentage. | {} |
| items | yes | array<string> | An array of item ids that should be show under this subcategory | {"uniqueItems":true} |

## MenuSubCategoryResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/MenuSubCategoryEntity |  | {} |
| data | no | #/components/schemas/MenuSubCategoryEntity |  | {} |

## MenuUpdatedEvent

Title: Menu Updated Event

Event is triggered when an menu is updated

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string |  | {"enum":["MENU_UPDATED"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## MultipleMenuEntity

Required fields: `categories`, `fulfillment`, `id`, `name`, `service_availability`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| name_localized | no | string | Second language menu name | {"minLength":1} |
| service_availability | yes | array<#/components/schemas/ServiceAvailabilityEntity> | [Menu V4 only] Service availability details for the menu. Not supported in Menu V3 and below.. | {} |
| service_availability[] | no | #/components/schemas/ServiceAvailabilityEntity |  | {} |
| name | yes | string | Menu name | {"minLength":1} |
| id | yes | string | Menu identifier | {"minLength":1} |
| fulfillment | yes | array<string> | Supported fulfillment modes for this menu | {"uniqueItems":true} |
| categories | yes | array<object> | Menu categories with nested subcategories and items | {} |
| categories[].reference_id | yes | string | Category identifier | {"minLength":1} |
| categories[].subcategories | yes | array<object> |  | {} |
| categories[].subcategories[].reference_id | yes | string | Subcategory identifier | {"minLength":1} |
| categories[].subcategories[].items | yes | array<object> |  | {} |
| categories[].subcategories[].items[].selections | no | array<object> |  | {} |
| categories[].subcategories[].items[].selections[].min_permitted | no | number | Minimum quantity allowed (inclusive) | {"minimum":0,"multipleOf":1} |
| categories[].subcategories[].items[].selections[].reference_id | yes | string | Modifier group identifier | {} |
| categories[].subcategories[].items[].selections[].max_permitted | no | number | Maximum quantity allowed (inclusive) | {"minimum":0,"multipleOf":1} |
| categories[].subcategories[].items[].selections[].modifiers | yes | array<object> |  | {} |
| categories[].subcategories[].items[].selections[].modifiers[].selections | no | array<unknown> | Nested selections for the modifiers | {} |
| categories[].subcategories[].items[].selections[].modifiers[].min_permitted | no | number | Minimum quantity allowed (inclusive) | {"minimum":0,"multipleOf":1} |
| categories[].subcategories[].items[].selections[].modifiers[].reference_id | yes | string | Modifier identifier | {} |
| categories[].subcategories[].items[].selections[].modifiers[].price | no | integer | Modifier price as a formatted number | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| categories[].subcategories[].items[].selections[].modifiers[].max_permitted | no | number | Maximum quantity allowed (inclusive) | {"minimum":0,"multipleOf":1} |
| categories[].subcategories[].items[].reference_id | yes | string | Item identifier | {"minLength":1} |
| categories[].subcategories[].items[].price | no | integer | Item price as a formatted number | {"minimum":0,"maximum":999999999,"multipleOf":1} |

## NForNDealsResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/DealGetNForNEntity |  | {} |
| data | no | #/components/schemas/DealGetNForNEntity |  | {} |

## NForPriceNDealsResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/DealGetNForPriceNEntity |  | {} |
| data | no | #/components/schemas/DealGetNForPriceNEntity |  | {} |

## NutritionInfoEntity

Defines nutritional details for an item, and modifier. Allows updates only as a complete object.

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| kilojoules | no | #/components/schemas/NutritionTypeEntity |  | {} |
| kilojoules | no | #/components/schemas/NutritionTypeEntity |  | {} |
| carbohydrates | no | #/components/schemas/NutritionTypeEntity |  | {} |
| carbohydrates | no | #/components/schemas/NutritionTypeEntity |  | {} |
| salt | no | #/components/schemas/NutritionTypeEntity |  | {} |
| salt | no | #/components/schemas/NutritionTypeEntity |  | {} |
| spiciness | no | string | List of spiciness in the product.Allow single value. | {"enum":["UNKNOWN","MILD","MEDIUM","HOT","VERY_HOT"]} |
| protein | no | #/components/schemas/NutritionTypeEntity |  | {} |
| protein | no | #/components/schemas/NutritionTypeEntity |  | {} |
| dietary_restriction | no | string | List of dietary restriction in the product. Allow single value. | {"enum":["VEGETARIAN","VEGAN","GLUTEN_FREE","NON-VEGETARIAN"]} |
| calories | no | #/components/schemas/NutritionTypeEntity |  | {} |
| calories | no | #/components/schemas/NutritionTypeEntity |  | {} |
| saturated_fat | no | #/components/schemas/NutritionTypeEntity |  | {} |
| saturated_fat | no | #/components/schemas/NutritionTypeEntity |  | {} |
| sugar | no | #/components/schemas/NutritionTypeEntity |  | {} |
| sugar | no | #/components/schemas/NutritionTypeEntity |  | {} |
| additive | no | array<string> | List of additive in the product. Allow multiple values | {"uniqueItems":true} |
| allergens | no | array<string> | List of allergens in the product. Allow multiple values | {"uniqueItems":true} |

## NutritionTypeEntity

Required fields: `lower_range`, `upper_range`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| upper_range | yes | number | The upper range of the energy content.  | {} |
| lower_range | yes | number | The lower range of the energy content. | {} |

## OpenCloseHoursUpdateEvent

Title: Open Close Hours Update Event

Event is triggered when store open/close hours are updated

Required fields: `event_type`, `operation`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| event_type | yes | string | Event is triggered when store open/close hours are created, updated, or deleted | {"enum":["OPEN_CLOSE_HOURS_UPDATE"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| operation | yes | string | The operation that was performed on the open hours | {"enum":["CREATE","UPDATE","DELETE"]} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## OrderAcceptedEvent

Title: Order Accepted Event

Event is triggered when an order is transitioned into the ORDER_ACCEPTED state

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when an order is transitioned into the ORDER_ACCEPTED state | {"enum":["ORDER_ACCEPTED"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## OrderByIdResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/OrderEntity |  | {} |
| data | no | #/components/schemas/OrderEntity |  | {} |

## OrderCancellationRequest

Title: Order Cancellation

Required fields: `notes`, `reason`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| reason | yes | string |  | {"enum":["OTHER","DRIVER_UNAVAILABLE","OUT_OF_STOCK","REFUNDED_ORDER","TAKEAWAY_BUSY","SHOP_CLOSED","UNDELIVERABLE_AREA"]} |
| notes | yes | string |  | {} |
| cancelled_by | no | string | Name of the provider or source that cancelled the order | {} |

## OrderCancelledEvent

Title: OrderCancelledEvent

Event triggered when an order is cancelled

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`, `cancel_reason`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| cancel_message | no | string | Additional message for the order cancellation | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| cancel_reason | yes | string | Reason for the order cancellation | {"enum":["OUT_OF_STOCK","STORE_CLOSED","TOO_BUSY","CUSTOMER_CANCELLED","OTHER"]} |
| event_type | yes | string | Event triggered when an order is cancelled | {"enum":["ORDER_CANCELLED"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## OrderEntity

Title: Order Entity

Required fields: `charges`, `customer`, `discounts`, `fulfillment_type`, `id`, `items`, `notes`, `placed_on`, `status`, `subtotal`, `total`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| notes | yes | string | Any special notes for the order | {"maxLength":1024} |
| order_number | no | string | The auto incrementing daily order id, such as 10 if this order is the 10th order of the day | {} |
| source | no | string | This is the original source of the order | {} |
| table_id | no | number | This field represents the selected table id for the dine-in orders | {} |
| table_name | no | string | This field represents the selected table number for the dine-in orders | {} |
| est_pickup | no | string | This value will be populated when the order is Collection or Delivery | {} |
| pre_order_time | no | string | The date/time when the order was pre-ordered | {"format":"date-time"} |
| total | yes | number | Total amount, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| order_cancellation_reason | no | string | A textual representation of why the order was cancelled | {} |
| discounts | yes | #/components/schemas/DiscountsEntity |  | {} |
| discounts | yes | #/components/schemas/DiscountsEntity |  | {} |
| friendly_id | no | string | This is order id for Aggregators | {} |
| id | yes | string | Identifier that uniquely identifies the order | {"minLength":1} |
| total_carry_bags | no | number | Indicates the total carry bags used for this order. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| source_device_type | no | string | This field identifies the order's source platform, aiding in efficient tracking and management based on its origin | {"enum":["KIOSK","MOBILE","WEB","VOICE","CHAT","POS","WEB_POS"]} |
| payment_status | no | string | Indicates payment status | {"enum":["PAID","UNPAID"]} |
| external_reference_id | no | string | This is order id for extenal partners | {} |
| fulfillment_type | yes | string | Type of Fulfillment required | {"enum":["COLLECTION","DELIVERY"]} |
| payment_type | no | string | Indicates the mode of the payment | {"enum":["CASH","CARD","ONLINE"]} |
| charges | yes | allOf(#/components/schemas/ChargesEntity, object) |  | {} |
| charges | yes | allOf(#/components/schemas/ChargesEntity, object) |  | {} |
| subtotal | yes | number | Subtotal amount, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| delivery_info | no | #/components/schemas/DeliveryInfoEntity |  | {} |
| delivery_info | no | #/components/schemas/DeliveryInfoEntity |  | {} |
| placed_on | yes | string | The date/time when the order was placed | {"format":"date-time"} |
| utensils | no | boolean | Informs the store to package utensils with this order | {} |
| items | yes | array<#/components/schemas/OrderItemEntity> | List of items on the order | {} |
| items[] | no | #/components/schemas/OrderItemEntity |  | {} |
| customer | yes | #/components/schemas/CustomerEntity |  | {} |
| customer | yes | #/components/schemas/CustomerEntity |  | {} |
| status | yes | #/components/schemas/OrderStatus |  | {} |
| status | yes | #/components/schemas/OrderStatus |  | {} |

## OrderFulfilledEvent

Title: Order Fulfilled Event

Event is triggered when an order is transitioned into the ORDER_FULFILLED state

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when an order is transitioned into the ORDER_FULFILLED state | {"enum":["ORDER_FULFILLED"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## OrderHeaderEntity

Title: Order Header Entity

Required fields: `charges`, `customer`, `discounts`, `fulfillment_type`, `id`, `notes`, `placed_on`, `status`, `subtotal`, `total`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| notes | yes | string | Any special notes for the order | {} |
| payment_status | no | string | Indicates payment status | {"enum":["PAID","UNPAID"]} |
| order_number | no | string | The auto incrementing daily order id, such as 10 if this order is the 10th order of the day | {} |
| external_reference_id | no | string | This is order id for extenal partners | {} |
| source | no | string | This is the original source of the order | {"enum":["FOODHUB","JUSTEAT","UBEREATS","DELIVEROO"]} |
| fulfillment_type | yes | string | Type of Fulfillment required | {"enum":["COLLECTION","DELIVERY"]} |
| payment_type | no | string | Indicates the mode of the payment | {"enum":["CASH","CARD","ONLINE"]} |
| charges | yes | #/components/schemas/ChargesEntity |  | {} |
| charges | yes | #/components/schemas/ChargesEntity |  | {} |
| total | yes | number | Total amount, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| order_cancellation_reason | no | string | A textual representation of why the order was cancelled | {} |
| discounts | yes | #/components/schemas/DiscountsEntity |  | {} |
| discounts | yes | #/components/schemas/DiscountsEntity |  | {} |
| subtotal | yes | number | Sub amount, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| friendly_id | no | string | This is order id for Aggregators | {} |
| delivery_info | no | #/components/schemas/DeliveryInfoEntity |  | {} |
| delivery_info | no | #/components/schemas/DeliveryInfoEntity |  | {} |
| placed_on | yes | string | The date/time when the order was placed | {"format":"date-time"} |
| id | yes | string | Identifier that uniquely identifies the order | {"minLength":1} |
| utensils | no | boolean | Informs the store to package utensils with this order | {} |
| total_carry_bags | no | number | Indicates the total carry bags used for this order. | {} |
| customer | yes | #/components/schemas/CustomerEntity |  | {} |
| customer | yes | #/components/schemas/CustomerEntity |  | {} |
| status | yes | #/components/schemas/OrderStatus |  | {} |
| status | yes | #/components/schemas/OrderStatus |  | {} |

## OrderItemEntity

Required fields: `addons`, `id`, `line_item_id`, `notes`, `price`, `quantity`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| vat_split | no | #/components/schemas/VatSplitEntity |  | {} |
| vat_split | no | #/components/schemas/VatSplitEntity |  | {} |
| subcat_id | no | string | The subcat id of the item | {} |
| line_item_id | yes | string | Order Line Item ID | {} |
| quantity | yes | number | The total quantity requested for this item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| notes | yes | string | Any special notes specifically for the item | {"maxLength":1024} |
| category_name | no | string | The category name of the item | {} |
| category_id | no | string | The category id of the item | {} |
| addons | yes | array<object> | List of addons against the item | {} |
| addons[].modifier_group_id | no | string | Modifier group id for the addon | {} |
| addons[].quantity | yes | number | The total quantity requested for this addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| addons[].price | yes | number | Addon amount, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| addons[].parent_modifier_id | no | string | Parent modifier id for the addon | {} |
| addons[].name | yes | string | The title of the Addon | {} |
| addons[].modifier_group_name | no | string | modifier group name for the addon | {} |
| addons[].parent_modifier_group_id | no | string | Parent modifier group id for the addon | {} |
| addons[].id | yes | string | Addon identifier | {} |
| addons[].placement | no | string | Defines the placement of a Half_N_Half addon | {"enum":["LEFT","RIGHT","WHOLE"]} |
| price | yes | number | Item price, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| name | no | string | The title of the item | {} |
| id | yes | string | Order Item | {} |
| amendment_details | no | object | List of amendents against the item | {} |
| amendment_details.quantity | no | number | The total quantity requested for this item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| amendment_details.replacement_items | no | array<object> | List of replacement items against the item | {} |
| amendment_details.replacement_items[].quantity | no | number | The total quantity requested for this item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| amendment_details.replacement_items[].item_id | no | string | Order Item | {} |
| amendment_details.replacement_items[].price | no | number | Item price, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| amendment_details.amendment_type | no | string | The type of amendment | {"enum":["REPLACE_ITEM","REMOVE_ITEM","UPDATE_ITEM"]} |
| amendment_details.item_id | no | string | The id of the item | {} |
| amendment_details.price | no | number | Item price, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| amendment_details.original_items | no | array<object> | List of original items against the item | {} |
| amendment_details.original_items[].quantity | no | number | The total quantity requested for this item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| amendment_details.original_items[].item_id | no | string | Order Item | {} |
| amendment_details.original_items[].price | no | number | Item price, represented in the lowest currency unit, such as pence, paise, cents, yen, etc. | {"minimum":0,"maximum":999999999,"multipleOf":1} |

## OrderPlacedEvent

Title: Order Placed Event

Event is triggered when an order is transitioned into the ORDER_PLACED state

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when an order is transitioned into the ORDER_PLACED state | {"enum":["ORDER_PLACED"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## OrderReadyEvent

Title: Order Ready Event

Event is triggered when an order is transitioned into the ORDER_READY state

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event is triggered when an order is transitioned into the ORDER_READY state | {"enum":["ORDER_READY"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## OrderRefundRequest

Title: Order Refund

Required fields: `reason`, `refund_amount`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| reason | yes | string | reason for refund | {} |
| refund_amount | yes | integer | refund amount: (e.g: 1000 = £10.00) | {} |

## OrderReplaceEntity

Title: Order Replace Entity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| deal_amendment | no | array<object> | Remove deals from the order. | {} |
| deal_amendment[].amendment_type | yes | string | Type of deal adjustment. | {"enum":["REMOVE_DEAL"]} |
| deal_amendment[].qty | no | number | Quantity of the deal line item to remove. | {} |
| deal_amendment[].line_item_deal_id | yes | string | Identifier that uniquely identifies the deal line item (when amending deals). | {"minLength":1} |
| deal_amendment[].deal_id | yes | string | Identifier that uniquely identifies the deal. | {"minLength":1} |
| amendments | no | array<object> | Replace or Remove items from the order. | {} |
| amendments[].line_item_id | yes | string | Identifier that uniquely order item id. | {"minLength":1} |
| amendments[].quantity | yes | number | Quantity of the item to remove.If amendment type is REMOVE_ITEM, quantity should be 0 | {"minimum":0} |
| amendments[].replacement_items | no | array<object> | amendment type is REPLACE_ITEM, replacement_item should be provided. | {} |
| amendments[].replacement_items[].quantity | yes | number | Quantity of the item to replace.  | {"minimum":1} |
| amendments[].replacement_items[].item_id | yes | string | Identifier that uniquely identifies the item. | {"minLength":1} |
| amendments[].replacement_items[].price | yes | number | Single quantity price of the item. | {"minimum":0} |
| amendments[].item_id | yes | string | Identifier menu item id. | {"minLength":1} |
| amendments[].amendment_type | yes | string | Type of adjustments. | {"enum":["REMOVE_ITEM","REPLACE_ITEM","UPDATE_ITEM"]} |
| amendments[].price | yes | number | Single quantity price of the item. If amendment type is REMOVE_ITEM, price should be 0. | {"minimum":0} |

## OrderStatus

Title: Order Status Enum

Possible order status codes for any given order

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |

## OrderUpdatedEvent

Title: OrderUpdatedEvent

Event triggered when an order is updated

Required fields: `event_type`, `resource_href`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| resource_href | yes | string | URI of the resource that triggered the event | {} |
| event_type | yes | string | Event triggered when an order is updated | {"enum":["ORDER_UPDATED"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## PatchCustomerEntity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| phone | no | string | Phone number of the customer | {"maxLength":15} |
| last_name | no | string | Last name of the customer | {"minLength":1} |
| id | no | string | Identifier that uniquely identifies the customer(only applicable for Foodhub orders) | {} |
| phone_pin | no | string | Phone pin of the customer (used with proxy numbers) | {"maxLength":12} |
| first_name | no | string | First name of the customer | {"minLength":1} |
| email | no | string | Email address of the customer | {"format":"email"} |

## PatchOrderEntity

Title: Order Entity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| delivery | no | object |  | {} |
| delivery.notes | no | string | Delivery specific notes from the customer | {"maxLength":1024} |
| delivery.address | yes | object | The address where the order will be delivered | {} |
| delivery.address.area | no | string | Address Area | {} |
| delivery.address.formatted_address | no | string | The full address as a single-line formatted string | {} |
| delivery.address.flat_no | no | string | Flat Number | {} |
| delivery.address.unit_number | no | string | House/Building/Unit number | {} |
| delivery.address.address2 | no | string | Address Line 2 | {} |
| delivery.address.city | no | string | City | {} |
| delivery.address.address1 | no | string | Full address | {} |
| delivery.address.postcode | no | string | Address Postcode | {} |
| delivery.address.state | no | string | Address state | {} |
| delivery.address.type | yes | string | Type of the address | {"enum":["STREET_ADDRESS"]} |
| delivery.address.lat | no | number | Latitude | {"minimum":-90,"maximum":90} |
| delivery.address.long | no | number | Longitude | {"minimum":-180,"maximum":180} |
| delivery.type | yes | string | Delivery type for the order | {"enum":["DELIVERY_BY_RESTAURANT","DELIVERY_BY_COURIER"]} |
| notes | no | string | Any special notes for the order | {"maxLength":1024} |
| est_delivery_time | no | string | This is the estimated delivery time required for delivery orders | {"format":"date-time"} |
| source | no | string | This is the original source of the order | {} |
| fulfillment_type | no | string | Type of Fulfillment required | {"enum":["COLLECTION","DELIVERY"]} |
| pre_order_time | no | string | This is the pre order date time | {"format":"date-time"} |
| est_pick_up_time | no | string | This is the estimated pickup time required for collection orders and instore orders | {"format":"date-time"} |
| placed_on | no | string | The date/time when the order was placed | {"format":"date-time"} |
| payment | no | object |  | {} |
| payment.total | yes | number | The total amount for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.payment_type | yes | string | Indicates the mode of the payment | {"enum":["CASH","CARD","ONLINE"]} |
| payment.charges | yes | object |  | {} |
| payment.charges.surcharge | no | number | Surcharge Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.small_order_charge | no | number | Small order charge for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.delivery_fee | no | number | Delivery Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.tip_for_restaurant | no | number | Tip for restaurant for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.carry_bags_charge | no | number | Total charges applied to this order for carry bags | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.service_fee | no | number | Service fee for processing the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.other_charge | no | number | Other charge for the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.tax | yes | number | Total tax applied to this order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.driver_tips | no | number | Driver tips for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.charges.package_charge | no | number | Package charge Fee for delivering the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.discounts | no | array<object> |  | {} |
| payment.discounts[].discount_value | yes | number | Discount applied to the order | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.discounts[].discount_percentage | no | number | Percentage of the discount applied on the order | {"minimum":0,"maximum":100,"multipleOf":1} |
| payment.discounts[].discount_type | yes | string | Type of the discount applied to the order | {"enum":["FIXED_AMOUNT","PERCENTAGE"]} |
| payment.subtotal | yes | number | The total excluding charges | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| payment.payment_status | yes | string | Indicates payment status | {"enum":["PAID","UNPAID"]} |
| utensils | no | boolean | Informs the store to package utensils with this order | {} |
| items | no | array<object> | List of items on the order | {} |
| items[].quantity | yes | number | The total quantity requested for this item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].notes | no | string | Any special notes specifically for the item | {"maxLength":1024} |
| items[].category_name | no | string | The category name of the item | {} |
| items[].addons | yes | array<object> | List of addons against the item | {} |
| items[].addons[].quantity | yes | number | The total quantity requested for this addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].addons[].addons | no | array<object> | List of nested addons against the item | {} |
| items[].addons[].addons[].quantity | yes | number | The total quantity requested for this addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].addons[].addons[].price | yes | number | Price of the Addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].addons[].addons[].name | yes | string | The title of the Addon | {} |
| items[].addons[].addons[].modifier_group_name | no | string | The title of the modifier group name | {} |
| items[].addons[].addons[].id | yes | string | Addon identifier | {} |
| items[].addons[].price | yes | number | Price of the Addon | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].addons[].name | yes | string | The title of the Addon | {} |
| items[].addons[].modifier_group_name | no | string | The title of the Addon | {} |
| items[].addons[].id | yes | string | Addon identifier | {} |
| items[].price | yes | number | Price of the item | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| items[].name | yes | string | The title of the item | {} |
| items[].id | yes | string | Order Item | {} |
| total_carry_bags | no | number | Indicates the total carry bags used for this order. | {"minimum":0,"maximum":999999999,"multipleOf":1} |
| customer | no | #/components/schemas/PatchCustomerEntity |  | {} |
| customer | no | #/components/schemas/PatchCustomerEntity |  | {} |
| status | no | string | Possible order status codes for any given order | {"enum":["ORDER_ACCEPTED","ORDER_PREPARING","ORDER_READY","ORDER_FULFILLED"]} |

## patchResellerRequest

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| owner | no | object | Defines owner's details | {} |
| owner.address | no | object | Defines owner's address details | {} |
| owner.address.unit_number | no | string | Flat/Building/Unit number | {} |
| owner.address.town | no | string | Town | {} |
| owner.address.city | no | string | City | {} |
| owner.address.street | no | string | Street | {} |
| owner.address.postcode | no | string | Address postcode | {} |
| owner.last_name | no | string | Last Name of the takeaway owner | {} |
| owner.phone_number | no | string | Contact number of the takeaway owner | {} |
| owner.first_name | no | string | First Name of the takeaway owner | {} |
| owner.email | no | string | Email address of the takeaway owner | {} |
| card_payment | no | boolean | Enable online payments for the takeaway | {"default":true} |
| address | no | object |  | {} |
| address.area | no | string | Area | {} |
| address.country | no | string | Country <a href='#section/Getting-Started/Country-and-Region'>See Documentation</a> | {} |
| address.unit_number | no | string | Flat/Building/Unit number | {} |
| address.city | no | string | City | {} |
| address.address1 | no | string | Street address | {} |
| address.postcode | no | string | Address postcode | {} |
| address.region | no | string | Region <a href='#section/Getting-Started/Country-and-Region'>See Documentation</a> | {} |
| address.lat | no | number | Latitude | {"minimum":-90,"maximum":90} |
| address.long | no | number | Longitude | {"minimum":-180,"maximum":180} |
| store_status | no | string | Specifies whether the store site should be live or in temporary status | {"enum":["TEST","LIVE"],"default":"LIVE"} |
| logo_image_url | no | object | URL of the logo image displayed to users when browsing for a store.Only accepts .jpg, .jpeg, .png, and .webp formats. | {} |
| sales_agent | no | anyOf(string, unknown) | Name of the sales agent. | {} |
| sales_agent | no | anyOf(string, unknown) | Name of the sales agent. | {} |
| cash_payment | no | boolean | Enable cash payment for the takeaway | {"default":false} |
| sales_agent_id | no | anyOf(string, unknown) | Sales Agent Identifier. | {} |
| sales_agent_id | no | anyOf(string, unknown) | Sales Agent Identifier. | {} |
| name | no | string | Name of the takeaway to onboard | {} |
| store_open | no | boolean | Is the store needs to be open for business | {"default":true} |
| hero_image_url | no | object | URL of the main image displayed when browsing for a store. Accepts .jpg, .jpeg, .png, and .webp formats. | {} |
| business_phone_number | no | string | Business phone number of the takeaway | {} |
| phone_number | no | string | Contact number of the takeaways | {} |
| email | no | string | Email address of the takeaway | {} |
| item_eligibility_rules | no | array<object> | Defines item quantity limits and restrictions based on tags (e.g., "ALCOHOL", "MEDICINE") for store-wide control over product availability. | {} |
| item_eligibility_rules[].unit | yes | string | Unit of measure | {"minLength":1} |
| item_eligibility_rules[].name | yes | string | tag name that the item is associated with | {"minLength":1} |
| item_eligibility_rules[].label | yes | string | Display-friendly label | {"minLength":1} |
| item_eligibility_rules[].type | yes | string | Restriction type | {"enum":["COUNT","VOLUME","WEIGHT"],"minLength":1} |
| item_eligibility_rules[].value | yes | string | Maximum allowed quantity  | {} |

## RefundOrderResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | object |  | {} |
| data.success | no | boolean | Refund status | {} |
| data.message | no | string | Refund message | {} |
| data.refund_id | no | integer | Refund Identifier | {} |
| data.amount_refunded | no | integer | Refunded amount | {} |

## resellerOnboardRequest

Required fields: `name`, `phone_number`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| owner | no | object | Defines owner's details | {} |
| owner.address | no | object | Defines owner's address details | {} |
| owner.address.unit_number | no | string | Flat/Building/Unit number | {} |
| owner.address.town | no | string | Town | {} |
| owner.address.city | no | string | City | {} |
| owner.address.street | no | string | Street | {} |
| owner.address.postcode | no | string | Address postcode | {} |
| owner.last_name | no | string | Last Name of the takeaway owner | {} |
| owner.phone_number | no | string | Contact number of the takeaway owner | {} |
| owner.first_name | no | string | First Name of the takeaway owner | {} |
| owner.email | no | string | Email address of the takeaway owner | {} |
| card_payment | no | boolean | Enable online payments for the takeaway | {"default":true} |
| address | no | object |  | {} |
| address.area | no | string | Area | {} |
| address.country | no | string | Country <a href='#section/Getting-Started/Country-and-Region'>See Documentation</a> | {} |
| address.unit_number | no | string | Flat/Building/Unit number | {} |
| address.city | yes | string | City | {} |
| address.address1 | yes | string | Street address | {} |
| address.postcode | yes | string | Address postcode | {} |
| address.region | no | string | Region <a href='#section/Getting-Started/Country-and-Region'>See Documentation</a> | {} |
| address.lat | no | number | Latitude | {"minimum":-90,"maximum":90} |
| address.long | no | number | Longitude | {"minimum":-180,"maximum":180} |
| store_status | no | string | Specifies whether the store site should be live or in temporary status | {"enum":["TEST","LIVE"],"default":"LIVE"} |
| logo_image_url | no | object | URL of the logo image displayed to users when browsing for a store.Only accepts .jpg, .jpeg, .png, and .webp formats. | {} |
| sales_agent | no | anyOf(string, unknown) | Name of the sales agent. | {} |
| sales_agent | no | anyOf(string, unknown) | Name of the sales agent. | {} |
| merchant_id | no | number | Payment Merchant ID for the store | {} |
| cash_payment | no | boolean | Enable cash payment for the takeaway | {"default":false} |
| sales_agent_id | no | anyOf(string, unknown) | Sales Agent Identifier. | {} |
| sales_agent_id | no | anyOf(string, unknown) | Sales Agent Identifier. | {} |
| name | yes | string | Name of the takeaway to onboard | {} |
| store_open | no | boolean | Is the store needs to be open for business | {"default":true} |
| hero_image_url | no | object | URL of the main image displayed to users when browsing for a store. Only accepts .jpg, .jpeg, .png, and .webp formats. | {} |
| business_phone_number | no | string | Business phone number of the takeaway | {} |
| phone_number | yes | string | Contact number of the takeaways | {} |
| email | no | string | Email address of the takeaway | {} |
| item_eligibility_rules | no | array<object> | Defines item quantity limits and restrictions based on tags (e.g., "ALCOHOL", "MEDICINE") for store-wide control over product availability. | {} |
| item_eligibility_rules[].unit | yes | string | Unit of measure | {"minLength":1} |
| item_eligibility_rules[].name | yes | string | tag name that the item is associated with | {"minLength":1} |
| item_eligibility_rules[].label | yes | string | Display-friendly label | {"minLength":1} |
| item_eligibility_rules[].type | yes | string | Restriction type | {"enum":["COUNT","VOLUME","WEIGHT"],"minLength":1} |
| item_eligibility_rules[].value | yes | string | Maximum allowed quantity  | {} |

## ResellerOnboardResponseModel

Title: Reseller Onboard Response

Required fields: `storeId`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| siteUrl | no | string | The web address of the site. | {} |
| storeId | yes | string | Store Identifier | {} |

## ScheduleDateTimeEntity

Required fields: `end_time`, `start_time`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| end_date | no | string | The date at which the menu ceases to be available, in YYYY-MM-DD format eg 2024-12-01  leave empty always visible | {} |
| start_time | yes | string | The time at which the menu becomes available, in 24-hour HH:MM format, e.g. “08:30”, “23:00” | {} |
| end_time | yes | string | The time at which the menu ceases to be available, in 24-hour HH:MM format, e.g. “08:30”, “23:00” | {} |
| start_date | no | string | The date at which the menu becomes available, in YYYY-MM-DD format eg 2024-01-01 leave empty always visible | {} |

## ScheduleEntity

Required fields: `end_time`, `start_time`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| end_date | no | string | The date at which the menu ceases to be available, in YYYY-MM-DD format eg 2024-12-01  leave empty always visible | {} |
| start_time | yes | string | The time at which the menu becomes available, in 24-hour HH:MM format, e.g. “08:30”, “23:00” | {} |
| end_time | yes | string | The time at which the menu ceases to be available, in 24-hour HH:MM format, e.g. “08:30”, “23:00” | {} |
| start_date | no | string | The date at which the menu becomes available, in YYYY-MM-DD format eg 2024-01-01 leave empty always visible | {} |

## ServiceAvailabilityEntity

Service availability details.

Required fields: `time_periods`, `weekday`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| weekday | yes | array<string> | Weekdays when the menu is available | {"uniqueItems":true} |
| time_periods | yes | array<object> | Time periods for the selected weekdays | {} |
| time_periods[].time | yes | object |  | {} |
| time_periods[].time.from | yes | string | Start time in HH:MM format | {} |
| time_periods[].time.to | yes | string | End time in HH:MM format | {} |

## SpecialHoursUpdateEvent

Title: Special Hours Open/Close Update Event

Event is triggered when store holiday open/close hours are updated

Required fields: `event_type`, `operation`, `client_id`, `event_id`, `event_time`, `store_id`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| store_id | yes | string | Store Identifier for which this event was generated for | {} |
| event_type | yes | string | Event is triggered when store holiday open/close hours are created, updated, or deleted | {"enum":["MANAGE_HOLIDAY_OPEN_CLOSE_UPDATE"]} |
| event_id | yes | string | Unique Event Identifier | {} |
| operation | yes | string | The operation that was performed on the holiday open/close hours | {"enum":["CREATE","UPDATE","DELETE"]} |
| client_id | yes | string | Applications client identifier | {} |
| event_time | yes | string | The timestamp when the event was generated (ISO 8601) | {"format":"date-time"} |

## StoreByIdResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/StoreEntity |  | {} |
| data | no | #/components/schemas/StoreEntity |  | {} |

## StoreEntity

Title: Store Entity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| owner | no | object | Defines owner's details | {} |
| owner.address | no | object | Defines owner's address details | {} |
| owner.address.unit_number | no | string | Flat/Building/Unit number | {} |
| owner.address.town | no | string | Town | {} |
| owner.address.city | no | string | City | {} |
| owner.address.street | no | string | Street | {} |
| owner.address.postcode | no | string | Address postcode | {} |
| owner.last_name | no | string | Last Name of the takeaway owner | {} |
| owner.phone_number | no | string | Contact number of the takeaway owner | {} |
| owner.first_name | no | string | First Name of the takeaway owner | {} |
| owner.email | no | string | Email address of the takeaway owner | {} |
| card_payment | no | boolean | Enable online payments for the takeaway | {} |
| address | no | object | The store address | {} |
| address.area | yes | string | Address Area | {} |
| address.country | yes | string | Country | {} |
| address.country_code | no | string | Country code | {} |
| address.unit_number | yes | string | Flat/Building/Unit number | {} |
| address.city | yes | string | Address City | {} |
| address.address1 | yes | string | The first line of the stores address | {} |
| address.postcode | yes | string | Postcode of the stores address | {} |
| address.region | yes | string | Region | {} |
| address.lat | yes | string | Latitude | {} |
| address.long | yes | string | Longitude | {} |
| store_status | no | string | Specifies whether the store site should be live or in temporary status | {"enum":["TEST","LIVE"],"default":"LIVE"} |
| logo_image_url | no | object | URL of the logo image displayed to users when browsing for a store.Only accepts .jpg, .jpeg, .png, and .webp formats. | {} |
| sales_agent | no | anyOf(string, unknown) | Name of the sales agent. | {} |
| sales_agent | no | anyOf(string, unknown) | Name of the sales agent. | {} |
| description | no | string | A general description of the store | {} |
| tax | no | object | Sales-tax breakdown for stores in the United States or Canada. Omitted when the store country is outside those regions. | {} |
| tax.rate | no | number | If type is FIXED: fixed tax amount in the smallest currency unit (e.g. 2). If type is PERCENTAGE: percentage (whole or fractional, e.g. 20 or 8.25). | {} |
| tax.tax_priority | no | boolean | Apply sales tax at the item level if enabled | {} |
| tax.is_tax_included | no | boolean | Whether tax is included in listed prices for US/CA stores | {} |
| tax.type | no | string | FIXED: a fixed amount per item (e.g. $1.50 per item). PERCENTAGE: a percentage of the item price (e.g. 5%). | {"enum":["FIXED","PERCENTAGE"]} |
| tax.sales_tax_enabled | no | boolean | No item will have tax when it disabled | {} |
| merchant_id | no | number | Payment Merchant ID for the store | {} |
| cash_payment | no | boolean | Enable cash payments for the takeaway | {} |
| sales_agent_id | no | anyOf(string, unknown) | Sales Agent Identifier. | {} |
| sales_agent_id | no | anyOf(string, unknown) | Sales Agent Identifier. | {} |
| website_url | no | string | The url for the stores web address | {} |
| name | no | string | The store name | {} |
| store_open | no | boolean | Is the store needs to be open for business | {"default":true} |
| hero_image_url | no | object | URL of the main image displayed to users when browsing for a store.Only accepts .jpg, .jpeg, .png, and .webp formats. | {} |
| business_phone_number | no | string | Business phone number of the takeaway | {} |
| phone_number | no | string | Registered phone number of the store owner, used for authenticating the application. | {} |
| id | no | string | A unique store identifier | {} |
| email | no | string | Email address of the takeaway | {} |
| item_eligibility_rules | no | array<object> | Defines item quantity limits and restrictions based on tags (e.g., "ALCOHOL", "MEDICINE") for store-wide control over product availability. | {} |
| item_eligibility_rules[].unit | yes | string | Unit of measure | {"minLength":1} |
| item_eligibility_rules[].name | yes | string | tag name that the item is associated with | {"minLength":1} |
| item_eligibility_rules[].label | yes | string | Display-friendly label | {"minLength":1} |
| item_eligibility_rules[].type | yes | string | Restriction type | {"enum":["COUNT","VOLUME","WEIGHT"],"minLength":1} |
| item_eligibility_rules[].value | yes | string | Maximum allowed quantity  | {} |

## StoreHoursResponse

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| data | no | #/components/schemas/UpdateStoreHoursRequest |  | {} |
| data | no | #/components/schemas/UpdateStoreHoursRequest |  | {} |

## StoreStatusEntity

Title: Store Status Entity

Required fields: `status`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| reason | no | string | Stores the Reason why store is paused | {} |
| paused_until | no | string | The date/time until when store is paused | {"format":"date-time"} |
| status | yes | string | Indicates Store status | {"enum":["PAUSE","RESUME"]} |

## TimeslotEntity

Title: Timeslot Entity

Required fields: `from`, `until`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| from | yes | string | Start time of this period as HH:MM e.g. 09:30 | {} |
| until | yes | string | End time of this period as HH:MM e.g. 13:00 | {} |

## TokenRequest

Title: Token Request

Required fields: `clientId`, `clientSecret`, `grant_type`, `scope`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| clientId | yes | string | The client ID is unique to the client application on that authorization server. | {} |
| grant_type | yes | string | The Client Credentials grant type is used by clients to obtain an access token outside of the context of a user | {"enum":["client_credentials"]} |
| scope | yes | string | A list of scopes that are requried | {"minLength":1} |
| clientSecret | yes | string | A client secret is a secret known only to your application and the authorization server. It protects your resources by only granting tokens to authorized requestors. Protect your client secrets and never include them in mobile or browser-based apps | {} |

## TokenResponse

Title: Token Response

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| access_token | no | string | Access Token represent as a Bearer Token, used with the Authorization header | {} |
| data | no | object | Warning: The data field in this response is deprecated, please use fields at the root of this Token Resonse | {} |
| data.access_token | yes | string | Access Token represent as a Bearer Token, used with the Authorization header | {} |
| data.scope | yes | string | A list of scopes that have been authorized against the token | {} |
| data.token_type | yes | string | Type of token the authorization server has issued. | {"enum":["Bearer"]} |
| data.expires_in | yes | number | Token expiration time represented as an unix epoch timestamp | {} |
| scope | no | string | A list of scopes that have been authorized against the token | {} |
| token_type | no | string | Type of token the authorization server has issued. | {"enum":["Bearer"]} |
| expires_in | no | number | The number of seconds the token is valid for, represented as an integer | {} |

## UpdateDeliveryZones

Title: Delivery Zones

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |

## UpdateMenuRequest

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| $ | no | #/components/schemas/MenuEntityModel |  | {} |

## UpdateOrderStatusRequest

Title: Update Order Status Request

Required fields: `status`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| pickup_time | no | string | Set order pick up date time. | {"format":"date-time"} |
| status | yes | string | Set the new status for this order | {"enum":["ORDER_ACCEPTED","ORDER_PREPARING","ORDER_COOKING_COMPLETED","ORDER_READY","ORDER_FULFILLED"]} |

## UpdateStoreHoursRequest

Required fields: `COLLECTION`, `DELIVERY`

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| COLLECTION | yes | #/components/schemas/WeeklyOpeningHoursEntity |  | {} |
| COLLECTION | yes | #/components/schemas/WeeklyOpeningHoursEntity |  | {} |
| DELIVERY | yes | #/components/schemas/WeeklyOpeningHoursEntity |  | {} |
| DELIVERY | yes | #/components/schemas/WeeklyOpeningHoursEntity |  | {} |

## VatSplitEntity

Title: Vat Split Entity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| label | no | string | Label | {} |
| value | no | array<object> | List of vat values applied. | {} |
| value[].amount | no | number | Amount | {} |
| value[].percentage | no | number | Percentage | {} |
| value[].label | no | string | Label | {} |
| value[].value | no | number | Value | {} |

## WeeklyOpeningHoursEntity

Title: Opening Hours Entity

Required fields: None listed

| Field | Required | Type | Description | Constraints |
| --- | --- | --- | --- | --- |
| TU | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| TU[] | no | #/components/schemas/TimeslotEntity |  | {} |
| MO | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| MO[] | no | #/components/schemas/TimeslotEntity |  | {} |
| SU | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| SU[] | no | #/components/schemas/TimeslotEntity |  | {} |
| TH | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| TH[] | no | #/components/schemas/TimeslotEntity |  | {} |
| FR | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| FR[] | no | #/components/schemas/TimeslotEntity |  | {} |
| WE | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| WE[] | no | #/components/schemas/TimeslotEntity |  | {} |
| SA | no | array<#/components/schemas/TimeslotEntity> |  | {} |
| SA[] | no | #/components/schemas/TimeslotEntity |  | {} |

