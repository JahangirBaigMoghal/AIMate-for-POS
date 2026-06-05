# FoodHub Partner API Endpoint Reference

Generated from the published OpenAPI document. The raw source is preserved in `../raw/foodhub-openapi.json`.

## Auth API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/auth/authorize | Authorize client |  | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429 | 302, 400, 401, 403, 429 |
| POST | /v1/auth/token | Generate access token |  | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, TokenRequest, TokenResponse | 200, 400, 401, 403, 429 |

### GET /v1/auth/authorize

Returns an Authorization code based on the client authorization flow

- Operation ID: `GET/v1/auth/authorize`
- Required scopes: None listed
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`
- Response codes: `302`, `400`, `401`, `403`, `429`

### POST /v1/auth/token

Returns an Access token based on the client credentials flow

- Operation ID: `POST/v1/auth/token`
- Required scopes: None listed
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `TokenRequest`, `TokenResponse`
- Response codes: `200`, `400`, `401`, `403`, `429`

## Coupons API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/stores/{storeId}/coupons | List coupons | store.coupons.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, couponListResponse | 200, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/coupons | Create coupon | store.coupons.create | CouponCreateResponse, CouponEntity, ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse409, ErrorResponse429 | 201, 400, 401, 403, 409, 422, 429 |
| DELETE | /v1/stores/{storeId}/coupons/{couponId} | Delete coupon | store.coupons.delete | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429 | 200, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/coupons/bulk | Bulk create coupons | store.coupons.create | BulkCreateCouponsRequest, CouponBulkCreateResponse, ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429 | 200, 400, 401, 403, 422, 429 |

### GET /v1/stores/{storeId}/coupons

Returns the coupons for the given store.

- Operation ID: `GET/v1/stores/{storeId}/coupons`
- Required scopes: `store.coupons.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `couponListResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/coupons

Create a coupon for the given store.

- Operation ID: `POST/v1/stores/{storeId}/coupons`
- Required scopes: `store.coupons.create`
- Referenced schemas: `CouponCreateResponse`, `CouponEntity`, `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse409`, `ErrorResponse429`
- Response codes: `201`, `400`, `401`, `403`, `409`, `422`, `429`

### DELETE /v1/stores/{storeId}/coupons/{couponId}

Delete a coupon for the given store.

- Operation ID: `DELETE/v1/stores/{storeId}/coupons/{couponId}`
- Required scopes: `store.coupons.delete`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/coupons/bulk

Create multiple coupons for the given store.

- Operation ID: `POST/v1/stores/{storeId}/coupons/bulk`
- Required scopes: `store.coupons.create`
- Referenced schemas: `BulkCreateCouponsRequest`, `CouponBulkCreateResponse`, `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`
- Response codes: `200`, `400`, `401`, `403`, `422`, `429`

## Deals API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/stores/{storeId}/deals | List deals | deals.get | DealsListResponse, ErrorResponse404 | 200, 404 |
| POST | /v1/stores/{storeId}/deals | Create deal | deals.create | CreateDealsRequest, ErrorResponse404 | 200, 404 |
| DELETE | /v1/stores/{storeId}/deals/{id} | Delete deal | deals.delete | ErrorResponse404 | 204, 404 |
| GET | /v1/stores/{storeId}/deals/{id} | Get deal | deals.get | DealsResponse, ErrorResponse404 | 200, 404 |
| PUT | /v1/stores/{storeId}/deals/{id} | Update deal | deals.update | ErrorResponse404 | 200, 404 |
| GET | /v1/stores/{storeId}/deals/discount/{id} | Get discount deal | deals.get | ErrorResponse404, discountResponse | 200, 404 |
| PUT | /v1/stores/{storeId}/deals/discount/{id} | Update discount deal | deals.update | DealsEntity, ErrorResponse404 | 200, 404 |
| GET | /v1/stores/{storeId}/deals/meals/{id} | Get meal deal | deals.get | ErrorResponse404, mealsResponse | 200, 404 |
| PUT | /v1/stores/{storeId}/deals/meals/{id} | Update meal deal | deals.update | DealUpdateMealEntity, ErrorResponse404 | 200, 404 |
| GET | /v1/stores/{storeId}/deals/n-for-n/{id} | Get n-for-n deal | deals.get | ErrorResponse404, NForNDealsResponse | 200, 404 |
| PUT | /v1/stores/{storeId}/deals/n-for-n/{id} | Update n-for-n deal | deals.update | DealUpdateNForNEntity, ErrorResponse404 | 200, 404 |
| GET | /v1/stores/{storeId}/deals/n-for-price-n/{id} | Get n-for-price-n deal | deals.get | ErrorResponse404, NForPriceNDealsResponse | 200, 404 |
| PUT | /v1/stores/{storeId}/deals/n-for-price-n/{id} | Update n-for-price-n deal | deals.update | DealUpdateNForPriceNEntity, ErrorResponse404 | 200, 404 |

### GET /v1/stores/{storeId}/deals

Get Deals for the given store.

- Operation ID: `GET/v1/stores/{storeId}/deals`
- Required scopes: `deals.get`
- Referenced schemas: `DealsListResponse`, `ErrorResponse404`
- Response codes: `200`, `404`

### POST /v1/stores/{storeId}/deals

Create Deals for the given store.

- Operation ID: `POST/v1/stores/{storeId}/deals`
- Required scopes: `deals.create`
- Referenced schemas: `CreateDealsRequest`, `ErrorResponse404`
- Response codes: `200`, `404`

### DELETE /v1/stores/{storeId}/deals/{id}

Delete Deals for the given store.

- Operation ID: `DELETE/v1/stores/{storeId}/deals/{id}`
- Required scopes: `deals.delete`
- Referenced schemas: `ErrorResponse404`
- Response codes: `204`, `404`

### GET /v1/stores/{storeId}/deals/{id}

Get Deals for the given store.

- Operation ID: `GET/v1/stores/{storeId}/deals/{id}`
- Required scopes: `deals.get`
- Referenced schemas: `DealsResponse`, `ErrorResponse404`
- Response codes: `200`, `404`

### PUT /v1/stores/{storeId}/deals/{id}

Update Deals for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/deals/{id}`
- Required scopes: `deals.update`
- Referenced schemas: `ErrorResponse404`
- Response codes: `200`, `404`

### GET /v1/stores/{storeId}/deals/discount/{id}

Get discount Deals for the given store.

- Operation ID: `GET/v1/stores/{storeId}/deals/discount/{id}`
- Required scopes: `deals.get`
- Referenced schemas: `ErrorResponse404`, `discountResponse`
- Response codes: `200`, `404`

### PUT /v1/stores/{storeId}/deals/discount/{id}

Update discount Deals for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/deals/discount/{id}`
- Required scopes: `deals.update`
- Referenced schemas: `DealsEntity`, `ErrorResponse404`
- Response codes: `200`, `404`

### GET /v1/stores/{storeId}/deals/meals/{id}

Get meals Deals for the given store.

- Operation ID: `GET/v1/stores/{storeId}/deals/meals/{id}`
- Required scopes: `deals.get`
- Referenced schemas: `ErrorResponse404`, `mealsResponse`
- Response codes: `200`, `404`

### PUT /v1/stores/{storeId}/deals/meals/{id}

Update meals Deals for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/deals/meals/{id}`
- Required scopes: `deals.update`
- Referenced schemas: `DealUpdateMealEntity`, `ErrorResponse404`
- Response codes: `200`, `404`

### GET /v1/stores/{storeId}/deals/n-for-n/{id}

Get n_for_n Deals for the given store.

- Operation ID: `GET/v1/stores/{storeId}/deals/n-for-n/{id}`
- Required scopes: `deals.get`
- Referenced schemas: `ErrorResponse404`, `NForNDealsResponse`
- Response codes: `200`, `404`

### PUT /v1/stores/{storeId}/deals/n-for-n/{id}

Update n_for_n Deals for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/deals/n-for-n/{id}`
- Required scopes: `deals.update`
- Referenced schemas: `DealUpdateNForNEntity`, `ErrorResponse404`
- Response codes: `200`, `404`

### GET /v1/stores/{storeId}/deals/n-for-price-n/{id}

Get n_for_price_n Deals for the given store.

- Operation ID: `GET/v1/stores/{storeId}/deals/n-for-price-n/{id}`
- Required scopes: `deals.get`
- Referenced schemas: `ErrorResponse404`, `NForPriceNDealsResponse`
- Response codes: `200`, `404`

### PUT /v1/stores/{storeId}/deals/n-for-price-n/{id}

Update n_for_price_n Deals for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/deals/n-for-price-n/{id}`
- Required scopes: `deals.update`
- Referenced schemas: `DealUpdateNForPriceNEntity`, `ErrorResponse404`
- Response codes: `200`, `404`

## Driver API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| DELETE | /v1/stores/{storeId}/orders/{id}/driver | Unassign driver | driver.fulfillment.delete | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429 | 204, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/orders/{id}/driver | Assign driver | driver.fulfillment.update | DriverLocationEntity, ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse409, ErrorResponse429, assignDriverResponse | 200, 400, 401, 403, 404, 409, 429 |

### DELETE /v1/stores/{storeId}/orders/{id}/driver

Un-Assign Driver to a Order

- Operation ID: `DELETE/v1/stores/{storeId}/orders/{id}/driver`
- Required scopes: `driver.fulfillment.delete`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/orders/{id}/driver

Assign Driver to a Order(If driver exists it will re-assign)

- Operation ID: `PUT/v1/stores/{storeId}/orders/{id}/driver`
- Required scopes: `driver.fulfillment.update`
- Referenced schemas: `DriverLocationEntity`, `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse409`, `ErrorResponse429`, `assignDriverResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `409`, `429`

## Menu API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/stores/{storeId}/menu | Get menu | menu.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuResponse | 200, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/menu | Upsert menu | menu.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, UpdateMenuRequest | 204, 400, 401, 403, 404, 429 |
| GET | /v1/stores/{storeId}/menu/category/{categoryId} | Get category | menu.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, menuCategoryResponse | 200, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/menu/category/{categoryId} | Update category | menu.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuCategoryPutEntity | 204, 400, 401, 403, 404, 429 |
| DELETE | /v1/stores/{storeId}/menu/item/{itemId} | Delete item | menu.delete | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429 | 204, 400, 401, 403, 404, 429 |
| GET | /v1/stores/{storeId}/menu/item/{itemId} | Get item | menu.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuItemResponse | 200, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/menu/item/{itemId} | Update item | menu.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuItemUpdateEntity | 204, 400, 401, 403, 404, 429 |
| DELETE | /v1/stores/{storeId}/menu/modifier/{modifierId} | Delete modifier | menu.delete | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429 | 204, 400, 401, 403, 404, 429 |
| GET | /v1/stores/{storeId}/menu/modifier/{modifierId} | Get modifier | menu.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuModifierResponse | 200, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/menu/modifier/{modifierId} | Update modifier | menu.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuModifierUpdateEntity | 204, 400, 401, 403, 404, 429 |
| GET | /v1/stores/{storeId}/menu/modifierGroup/{modifierGroupId} | Get modifier group | menu.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, menuModifierGroupResponse | 200, 400, 401, 403, 404, 429 |
| GET | /v1/stores/{storeId}/menu/subcategory/{subcategoryId} | Get subcategory | menu.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, MenuSubCategoryResponse | 200, 400, 401, 403, 404, 429 |

### GET /v1/stores/{storeId}/menu

Returns the menu for the given store.

- Operation ID: `GET/v1/stores/{storeId}/menu`
- Required scopes: `menu.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/menu

Create/Update the menu for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/menu`
- Required scopes: `menu.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `UpdateMenuRequest`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### GET /v1/stores/{storeId}/menu/category/{categoryId}

Return the details of the menu category for the given category.

- Operation ID: `GET/v1/stores/{storeId}/menu/category/{categoryId}`
- Required scopes: `menu.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `menuCategoryResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/menu/category/{categoryId}

Update the menu category for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/menu/category/{categoryId}`
- Required scopes: `menu.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuCategoryPutEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### DELETE /v1/stores/{storeId}/menu/item/{itemId}

Delete the menu item for the given store.

- Operation ID: `DELETE/v1/stores/{storeId}/menu/item/{itemId}`
- Required scopes: `menu.delete`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### GET /v1/stores/{storeId}/menu/item/{itemId}

Returns the details of the item for the given item.

- Operation ID: `GET/v1/stores/{storeId}/menu/item/{itemId}`
- Required scopes: `menu.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuItemResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/menu/item/{itemId}

Update the menu item for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/menu/item/{itemId}`
- Required scopes: `menu.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuItemUpdateEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### DELETE /v1/stores/{storeId}/menu/modifier/{modifierId}

Delete the menu modifier for the given store.

- Operation ID: `DELETE/v1/stores/{storeId}/menu/modifier/{modifierId}`
- Required scopes: `menu.delete`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### GET /v1/stores/{storeId}/menu/modifier/{modifierId}

Returns the details of the modifier for the given modifier.

- Operation ID: `GET/v1/stores/{storeId}/menu/modifier/{modifierId}`
- Required scopes: `menu.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuModifierResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/menu/modifier/{modifierId}

Update the menu modifier for the given store.

- Operation ID: `PUT/v1/stores/{storeId}/menu/modifier/{modifierId}`
- Required scopes: `menu.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuModifierUpdateEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### GET /v1/stores/{storeId}/menu/modifierGroup/{modifierGroupId}

Return the details of the menu modifierGroup for the given modifierGroup.

- Operation ID: `GET/v1/stores/{storeId}/menu/modifierGroup/{modifierGroupId}`
- Required scopes: `menu.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `menuModifierGroupResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### GET /v1/stores/{storeId}/menu/subcategory/{subcategoryId}

Return the details of the menu subcategory for the given subcategory.

- Operation ID: `GET/v1/stores/{storeId}/menu/subcategory/{subcategoryId}`
- Required scopes: `menu.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `MenuSubCategoryResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

## Orders API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| GET | /v1/stores/{storeId}/orders | List orders | orders.list | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, ListOrdersResponse | 200, 400, 401, 403, 429 |
| POST | /v1/stores/{storeId}/orders | Create order | orders.create | CreateOrderEntity, CreateOrderResponse, ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429 | 200, 400, 401, 403, 429 |
| GET | /v1/stores/{storeId}/orders/{id} | Get order | orders.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, OrderByIdResponse | 201, 400, 401, 403, 404, 429 |
| PATCH | /v1/stores/{storeId}/orders/{id} | Update order | orders.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, PatchOrderEntity | 204, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/orders/{id}/amend | Amend order | orders.amend | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, OrderReplaceEntity | 201, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/orders/{id}/cancel | Cancel order | orders.cancel | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, OrderCancellationRequest | 204, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/orders/{id}/refund | Refund order | orders.refund | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, OrderRefundRequest, RefundOrderResponse | 200, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/orders/{id}/status | Update status | orders.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, UpdateOrderStatusRequest | 204, 400, 401, 403, 404, 429 |

### GET /v1/stores/{storeId}/orders

Returns a list of orders for the given store.

- Operation ID: `GET/v1/stores/{storeId}/orders`
- Required scopes: `orders.list`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `ListOrdersResponse`
- Response codes: `200`, `400`, `401`, `403`, `429`

### POST /v1/stores/{storeId}/orders

Creates a new order for a given store.

- Operation ID: `POST/v1/stores/{storeId}/orders`
- Required scopes: `orders.create`
- Referenced schemas: `CreateOrderEntity`, `CreateOrderResponse`, `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`
- Response codes: `200`, `400`, `401`, `403`, `429`

### GET /v1/stores/{storeId}/orders/{id}

Returns a specific order for a given store.

- Operation ID: `GET/v1/stores/{storeId}/orders/{id}`
- Required scopes: `orders.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `OrderByIdResponse`
- Response codes: `201`, `400`, `401`, `403`, `404`, `429`

### PATCH /v1/stores/{storeId}/orders/{id}

Updates a specific order for the given store. This operation replaces the existing order details with the provided data.

- Operation ID: `PATCH/v1/stores/{storeId}/orders/{id}`
- Required scopes: `orders.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `PatchOrderEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/orders/{id}/amend

Replace, remove, or update items in the order.

- Operation ID: `POST/v1/stores/{storeId}/orders/{id}/amend`
- Required scopes: `orders.amend`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `OrderReplaceEntity`
- Response codes: `201`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/orders/{id}/cancel

Cancels a specific order for a given store.

- Operation ID: `POST/v1/stores/{storeId}/orders/{id}/cancel`
- Required scopes: `orders.cancel`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `OrderCancellationRequest`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/orders/{id}/refund

Partial Refund for a specific order for a given store.

- Operation ID: `POST/v1/stores/{storeId}/orders/{id}/refund`
- Required scopes: `orders.refund`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `OrderRefundRequest`, `RefundOrderResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/orders/{id}/status

Updates the status of a specific order for a given store.

- Operation ID: `POST/v1/stores/{storeId}/orders/{id}/status`
- Required scopes: `orders.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `UpdateOrderStatusRequest`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

## Store API

| Method | Path | Summary | Scopes | Request Schemas | Response Codes |
| --- | --- | --- | --- | --- | --- |
| POST | /v1/stores | Create store | stores.create | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, ResellerOnboardResponseModel, resellerOnboardRequest | 200, 400, 401, 403, 429 |
| GET | /v1/stores/{storeId} | Get store details | stores.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, StoreByIdResponse | 200, 400, 401, 403, 429 |
| PATCH | /v1/stores/{storeId} | Update store settings | stores.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, patchResellerRequest | 204, 400, 401, 403, 429 |
| PUT | /v1/stores/{storeId}/delivery-zones | Replace delivery zones | delivery-zones.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, UpdateDeliveryZones | 204, 400, 401, 403, 429 |
| GET | /v1/stores/{storeId}/opening-hours | Get opening hours | store.opening-hours.get | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, StoreHoursResponse | 200, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/opening-hours | Update opening hours | store.opening-hours.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse429, UpdateStoreHoursRequest | 204, 400, 401, 403, 429 |
| GET | /v1/stores/{storeId}/sections | List kitchen sections | store.sections.list | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, kitchenSectionResponse | 200, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/sections | Create kitchen section | store.sections.create | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, KitchenSectionEntity | 204, 400, 401, 403, 404, 429 |
| DELETE | /v1/stores/{storeId}/sections/{sectionId} | Delete kitchen section | store.sections.delete | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429 | 204, 400, 401, 403, 404, 429 |
| PUT | /v1/stores/{storeId}/sections/{sectionId} | Update kitchen section | store.sections.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, KitchenSectionEntity | 204, 400, 401, 403, 404, 429 |
| POST | /v1/stores/{storeId}/status | Update store status | store.status.update | ErrorResponse400, ErrorResponse401, ErrorResponse403, ErrorResponse404, ErrorResponse429, StoreStatusEntity | 204, 400, 401, 403, 404, 429 |

### POST /v1/stores

Onboard a new store into Foodhub

- Operation ID: `POST/v1/stores`
- Required scopes: `stores.create`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `ResellerOnboardResponseModel`, `resellerOnboardRequest`
- Response codes: `200`, `400`, `401`, `403`, `429`

### GET /v1/stores/{storeId}

Returns a store by id

- Operation ID: `GET/v1/stores/{storeId}`
- Required scopes: `stores.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `StoreByIdResponse`
- Response codes: `200`, `400`, `401`, `403`, `429`

### PATCH /v1/stores/{storeId}

Update the store settings

- Operation ID: `PATCH/v1/stores/{storeId}`
- Required scopes: `stores.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `patchResellerRequest`
- Response codes: `204`, `400`, `401`, `403`, `429`

### PUT /v1/stores/{storeId}/delivery-zones

Update the delivery zones for a given store (This will replace the existing zones)

- Operation ID: `PUT/v1/stores/{storeId}/delivery-zones`
- Required scopes: `delivery-zones.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `UpdateDeliveryZones`
- Response codes: `204`, `400`, `401`, `403`, `429`

### GET /v1/stores/{storeId}/opening-hours

Returns the opening-times for deliveries / collections for the given store.

- Operation ID: `GET/v1/stores/{storeId}/opening-hours`
- Required scopes: `store.opening-hours.get`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `StoreHoursResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/opening-hours

Update the opening-times for deliveries / collections for the given store. Days within the payload are optional, if omitted the we will consider that day as closed all day.

- Operation ID: `PUT/v1/stores/{storeId}/opening-hours`
- Required scopes: `store.opening-hours.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse429`, `UpdateStoreHoursRequest`
- Response codes: `204`, `400`, `401`, `403`, `429`

### GET /v1/stores/{storeId}/sections

Returns a list of kitchen sections for the given store

- Operation ID: `GET/v1/stores/{storeId}/sections`
- Required scopes: `store.sections.list`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `kitchenSectionResponse`
- Response codes: `200`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/sections

Create the kitchen section for the given store

- Operation ID: `POST/v1/stores/{storeId}/sections`
- Required scopes: `store.sections.create`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `KitchenSectionEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### DELETE /v1/stores/{storeId}/sections/{sectionId}

Delete the kitchen section for the given store

- Operation ID: `DELETE/v1/stores/{storeId}/sections/{sectionId}`
- Required scopes: `store.sections.delete`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### PUT /v1/stores/{storeId}/sections/{sectionId}

Update the kitchen section for the given store

- Operation ID: `PUT/v1/stores/{storeId}/sections/{sectionId}`
- Required scopes: `store.sections.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `KitchenSectionEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

### POST /v1/stores/{storeId}/status

Pause/Resume the order for the given store.

- Operation ID: `POST/v1/stores/{storeId}/status`
- Required scopes: `store.status.update`
- Referenced schemas: `ErrorResponse400`, `ErrorResponse401`, `ErrorResponse403`, `ErrorResponse404`, `ErrorResponse429`, `StoreStatusEntity`
- Response codes: `204`, `400`, `401`, `403`, `404`, `429`

