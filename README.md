# Admin Delivery Management System

A comprehensive administrative module for managing deliveries and scheduling orders. This system features a dynamic calendar interface, order filtering by location, and full CRUD (Create, Read, Update, Delete) capabilities.

---

## 📂 File Structure

### Backend: Logic, Database & Routing

- **`deliveries_model.js`**: The abstraction layer handling business logic and status code mapping.
- **`deliveries_db.js`**: Low-level database interactions and schema initialization.
- **`admin_routes.js`**: Express.js router handling server-side requests and authentication.

### Frontend & Client Logic

- **Deliveries Dashboard**: `admin_deliveries.ejs` & `admin_deliveries.js`
- **New Delivery**: `admin_new_delivery.ejs` & `admin_new_delivery.js`
- **Delivery Details**: `admin_delivery_details.ejs` & `admin_delivery_details.js`
- **Delivery Edit**: `admin_delivery_edit.ejs` & `admin_delivery_edit.js`

---

## 📄 Detailed Page Documentation

### 1. Deliveries Dashboard

**View:** `admin_deliveries.ejs` | **Logic:** `admin_deliveries.js`

- **Features:**
  - **Delivery Statistics**: Displays real-time counts of "Pending" vs "Delivered" items.
  - **Multi-View Calendar**: Interactive calendar supporting Day, Week, and Month views.
  - **Navigation Controls**: Ability to jump to "Today" or navigate through dates using Previous/Next controls.
- **Functions in `admin_deliveries.js`**:
  - `initializeDeliveriesCalendar(deliveries)`: Initializes the calendar state and event listeners.
  - `renderCalendar()`: The core rendering engine that switches context between views.
  - `renderDayView()`, `renderWeekView()`, `renderMonthView()`: Specific logic for drawing each timeframe.
  - `prev-btn` / `next-btn` / `today-btn` listeners: Logic to manipulate the `currentDate` object and re-render.

### 2. New Delivery Page

**View:** `admin_new_delivery.ejs` | **Logic:** `admin_new_delivery.js`

- **Features:**
  - **Order Filtering**: Search orders by customer name or filter by location badges (e.g., CLV, UWP).
  - **Batch Selection**: Select multiple available orders via checkboxes.
  - **Form Validation**: Enforces description lengths and ensures at least one order is selected.
- **Functions in `admin_new_delivery.js`**:
  - `searchInput` listener: Filters the "Available Orders" list based on string matching.
  - `applyLocationFilters()`: Toggles visibility of order cards based on selected location badges.
  - `updateSelectedCount()`: Dynamically updates the UI to show how many orders are currently checked.
  - `new-delivery-form` submit listener: Performs final client-side validation before POSTing data.

### 3. Delivery Details Page

**View:** `admin_delivery_details.ejs` | **Logic:** `admin_delivery_details.js`

- **Features:**
  - **Comprehensive Summary**: Displays total orders, unique customers, and scheduled timestamps.
  - **Order Breakdown**: Detailed list of every order in the delivery including addresses and contact info.
  - **Action Center**: Buttons to Edit, Delete, or toggle the delivery status (Complete/Uncomplete).
- **Functions in `admin_delivery_details.js`**:
  - `DOMContentLoaded` listener: Parses URL `success` parameters (e.g., `?success=deleted`) to trigger browser alerts and clean the URL state using `window.history.replaceState`.

### 4. Delivery Edit Page

**View:** `admin_delivery_edit.ejs` | **Logic:** `admin_delivery_edit.js`

- **Features:**
  - **Pre-filled Management**: Similar to the "New Delivery" page but populated with existing delivery data.
  - **Dynamic Re-assignment**: Add new orders or remove existing ones from a scheduled delivery.
- **Functions in `admin_delivery_edit.js`**:
  - `applyLocationFilters()` & `searchInput` listener: Identical filtering logic as the New Delivery script to maintain UX consistency.
  - `updateSelectedCount()`: Tracks the modified list of selected orders.
  - `DOMContentLoaded` listener: Handles feedback alerts specifically for successful updates.

---

## 📊 Delivery Status Definitions

| Code | Status        | Description                                  |
| :--- | :------------ | :------------------------------------------- |
| `0`  | **Pending**   | Delivery is scheduled but not yet processed. |
| `1`  | **Packed**    | Items are ready for transport.               |
| `2`  | **Arranged**  | Logistics/Route is finalized.                |
| `3`  | **Delivered** | Successfully reached the exchanger.          |

## 📊 Order Status Definitions

| Code | Status        | Description                                                    |
| :--- | :------------ | :------------------------------------------------------------- |
| `0`  | **Pending**   | Order submitted but not yet packed                             |
| `1`  | **Packed**    | Order packed and ready to be delivered                         |
| `2`  | **Delivered** | Order has been delivered to exchanger                          |
| `3`  | **Scheduled** | Delivery for the order has been arranged but not yet delivered |
| `4`  | **Deleted**   | Order removed and no longer reflected in system                |

---
