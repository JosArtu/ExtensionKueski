# Product Requirements Document (PRD)

## 1. Project Overview
**Name:** Kueski Pay Extension
**Description:** A browser extension that integrates Kueski Pay into compatible e-commerce sites, offering floating widgets, payment simulations, and one-click checkouts.
**Tech Stack:** 
* Frontend: (e.g., React, TypeScript, Tailwind CSS, Chrome Extension API)
* Backend: (e.g., Node.js, Express)
* Database: (e.g., PostgreSQL)

## 2. Target Audience & Use Cases
* Users who want to finance online purchases without leaving the merchant's site.
* Users who want a quick checkout experience bypassing long merchant forms.

## 3. Core Features
1. **Floating Widget:** Detects when a user is on a compatible store and injects a UI widget.
2. **Payment Simulator:** Calculates installments dynamically based on the scraped product price.
3. **Frictionless Checkout:** Connects to Kueski API to approve loans and bypass merchant forms.

## 4. User Flow
1. User navigates to a product page on a supported domain (e.g., store.com).
2. Extension parses the DOM to extract `Product Name`, `Price`, and `URL`.
3. Extension checks `GET /api/tiendas` to verify domain compatibility.
4. If compatible, the floating widget appears.
5. User clicks "Simulate Payment".
6. User clicks "Pay with Kueski", creating a record via `POST /api/prestamos`.

## 5. Database Schema
(For Cursor to write correct backend code, paste your exact tables here)
* **Usuario:** `id_usuario` (INT), `nombre` (VARCHAR), `correo` (VARCHAR, UNIQUE)...
* **Tienda:** `id_tienda` (INT), `dominio` (VARCHAR), `compatible_kueski` (BOOLEAN)...
* **Producto:** `id_producto` (INT), `precio` (DECIMAL), `url_producto` (TEXT)...

## 6. API Endpoints Reference
* `GET /api/usuarios/{id}` -> Returns user details.
* `POST /api/usuarios` -> Body: `{ nombre, apellidos, edad, foto_de_perfil }`.
* `POST /api/prestamos` -> Body: `{ id_usuario, pago_restante, fecha_creacion... }`

## 7. Out of Scope (What NOT to build)
* We are NOT building the actual banking/credit approval backend, only the extension interface and mockup APIs.