# Kueski Pay Extension - E-commerce Payment System

## Project Overview

The system consists of a browser extension designed to seamlessly integrate **Kueski Pay** into compatible online stores[cite: 2]. Through a floating widget, users can view payment options, simulate installments in real-time, and start the *checkout* process bypassing long forms, thus improving the shopping experience and reducing cart abandonment.

## Main Features

* **Smart Floating Widget:** An interactive and adaptable widget that remains visible during navigation to facilitate quick access to Kueski Pay.
* **Payment Simulation:** Automatic, real-time calculation of deferred payments, allowing the user to see estimated installments and dates without leaving the page.
* **Checkout Integration:** Initiation and confirmation of payments directly from the widget, reducing friction and purchase steps.
* **Widget Customization:** Users can minimize, move, and adjust the visual theme (light/dark) of the widget according to their preferences.
* **Multisite Compatibility:** Works consistently across different e-commerce platforms and modern web browsers.

## Target Audience (Personas)

The design and user stories focus primarily on two profiles:
1. **The Analytical Buyer (Carlos Martinez, 38):** Looks for quick and accessible payments, hates long forms, and tends to abandon the *checkout* if it is tedious[cite: 2].
2. **The Flexible Buyer (Andrea Lopez, 24):** Seeks to manage her budget through transparent deferred payments, making quick purchases from mobile devices.

## Database Structure

The relational model supports the system's operations through the following main tables:
* **Usuario (User):** Stores identifiers, names, emails, and user types.
* **Tienda (Store):** Registers e-commerce domains and their compatibility with Kueski.
* **Producto (Product):** Saves the name, price, URL, and detection date of the items.
* **Prestamo (Loan):** Links the user, store, and product with total amounts, remaining payments, and interest.
* **Oferta (Offer):** Manages promotions, months without interest, and validity dates.
* **Simulacion Pago (Payment Simulation):** Records payment estimates requested by users.
* **Evento Uso (Usage Event):** Maintains traceability of interactions (e.g., *checkout* initiated, store validated).
* **Preferencias Widget (Widget Preferences):** Saves the visual configuration (position, theme, minimized state) per user.

## API Endpoints

The system features a RESTful API for communication between the frontend (extension) and the backend:

* `GET /api/usuarios/{id}`: Retrieves information and balance of the logged-in user.
* `POST /api/usuarios`: Creates a new user in the system.
* `GET /api/prestamos/{id_usuario}`: Returns active loans, remaining payments, and cutoff dates.
* `POST /api/prestamos`: Generates a new loan after a successful purchase.
* `GET /api/ofertas`: Displays exclusive limited-time promotions.
* `GET /api/tiendas`: Queries the list of stores compatible with the system.