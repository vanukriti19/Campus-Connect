# CampusConnect 🎓

> The unified college event discovery, bookmarking, and registration hub.

Built with **React**, **Vite**, **Tailwind CSS**, and **React Router**, featuring an abstraction layer ready for immediate PostgreSQL / Supabase integration.

---

## 🚀 Key Features

### For Students
* **Event Discovery Feed:** Browse upcoming college hackathons, cultural festivals, workshops, sports tournaments, and seminars.
* **Instant Search & Multi-Criteria Filters:** Filter by category (`Technical`, `Cultural`, `Sports`, `Workshop`, `Hackathon`, `Seminar`) and status (`Upcoming`, `Seats Available`, `Completed`).
* **Detailed Event Briefings:** Dedicated `/events/:id` view with countdown clock, agenda breakdown, organizer profile, and seat capacity meter.
* **One-Click Event Registration:** Fast registration with duplicate-prevention, student ID validation, and real-time capacity decrementing.
* **Digital Admission Passes:** Access registered passes in the **My Passes** (`/my-registrations`) tab, complete with pass codes and QR previews.
* **Personal Wishlist / Bookmarks:** Save events to the **Saved** (`/saved`) tab with a single click.

### For Campus Admins
* **Role Switcher:** Convenient one-click toggle in the navbar to test both Student and Admin views.
* **Admin Studio (`/admin`):** Analytics KPIs (Total Events, Registrations, Fill Rate %, Active Events).
* **Full Event CRUD:** Create, Edit, and Delete events with live banner image preview and validation.
* **Attendee Roster & CSV Export:** View registered students per event, search attendees, revoke registrations, or export the attendee roster as `.csv`.
* **Database Reset Utility:** Reset to pre-seeded college mock data anytime with a single click in the navbar.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18/19 (Functional Components, Hooks)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS v3
* **Routing:** React Router DOM v6
* **Icons:** Lucide React
* **Delight:** Canvas Confetti
* **State & Persistence:** React Context API + LocalStorage Data Access Layer (DAL)

---

## 📁 Project Structure

```
CampusConnect/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AttendeeRosterModal.jsx
│   │   │   ├── EventFormModal.jsx
│   │   │   └── StatCard.jsx
│   │   ├── common/
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Navbar.jsx
│   │   └── events/
│   │       ├── EventCard.jsx
│   │       ├── EventFilters.jsx
│   │       ├── EventGrid.jsx
│   │       ├── EventSearch.jsx
│   │       └── RegistrationModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── BookmarkContext.jsx
│   │   ├── EventContext.jsx
│   │   ├── RegistrationContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx
│   │   ├── EventDetailPage.jsx
│   │   ├── EventsExplorePage.jsx
│   │   ├── HomePage.jsx
│   │   ├── MyRegistrationsPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── SavedEventsPage.jsx
│   ├── services/
│   │   ├── bookmarkService.js
│   │   ├── eventService.js
│   │   ├── mockData.js
│   │   ├── registrationService.js
│   │   └── storage.js
│   ├── utils/
│   │   └── formatters.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 💻 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🗄️ Future Supabase Integration

The Data Access Layer in `src/services/` mirrors the normalized relational PostgreSQL schema:
* `events` table
* `registrations` table (with `UNIQUE(event_id, student_email)` constraint)
* `bookmarks` table

To migrate to Supabase:
1. Initialize `@supabase/supabase-js`.
2. Swap the localStorage methods in `src/services/eventService.js` and `src/services/registrationService.js` with `supabase.from('events')` queries.
3. The UI components require **zero** modifications because all operations pass through the decoupled service abstractions.
