import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import EventsExplorePage from './pages/EventsExplorePage';
import EventDetailPage from './pages/EventDetailPage';
import SavedEventsPage from './pages/SavedEventsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

import RegistrationModal from './components/events/RegistrationModal';
import EventFormModal from './components/admin/EventFormModal';
import AttendeeRosterModal from './components/admin/AttendeeRosterModal';
import ConfirmationModal from './components/common/ConfirmationModal';
import AuthModal from './components/auth/AuthModal';
import { useEvents } from './context/EventContext';

export default function App() {
  const { deleteEvent } = useEvents();

  // Modal States
  const [registerModal, setRegisterModal] = useState({ isOpen: false, event: null });
  const [eventFormModal, setEventFormModal] = useState({ isOpen: false, event: null });
  const [rosterModal, setRosterModal] = useState({ isOpen: false, event: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, event: null });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Action Handlers
  const handleOpenRegister = (event) => {
    setRegisterModal({ isOpen: true, event });
  };

  const handleOpenCreate = () => {
    setEventFormModal({ isOpen: true, event: null });
  };

  const handleOpenEdit = (event) => {
    setEventFormModal({ isOpen: true, event });
  };

  const handleOpenRoster = (event) => {
    setRosterModal({ isOpen: true, event });
  };

  const handleOpenDelete = (event) => {
    setDeleteModal({ isOpen: true, event });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.event) {
      deleteEvent(deleteModal.event.id);
    }
    setDeleteModal({ isOpen: false, event: null });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#120c10] text-[#faf3ee] editorial-bg">
      {/* Navigation */}
      <Navbar
        onOpenCreateModal={handleOpenCreate}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onRegisterClick={handleOpenRegister}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleOpenDelete}
              />
            }
          />
          <Route
            path="/events"
            element={
              <EventsExplorePage
                onRegisterClick={handleOpenRegister}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleOpenDelete}
              />
            }
          />
          <Route
            path="/events/:id"
            element={
              <EventDetailPage
                onRegisterClick={handleOpenRegister}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleOpenDelete}
                onViewAttendeesClick={handleOpenRoster}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedEventsPage
                onRegisterClick={handleOpenRegister}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleOpenDelete}
              />
            }
          />
          <Route
            path="/my-registrations"
            element={<MyRegistrationsPage />}
          />
          <Route
            path="/admin"
            element={
              <AdminDashboardPage
                onOpenCreateModal={handleOpenCreate}
                onOpenEditModal={handleOpenEdit}
                onViewAttendees={handleOpenRoster}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <RegistrationModal
        isOpen={registerModal.isOpen}
        event={registerModal.event}
        onClose={() => setRegisterModal({ isOpen: false, event: null })}
      />

      <EventFormModal
        isOpen={eventFormModal.isOpen}
        initialEvent={eventFormModal.event}
        onClose={() => setEventFormModal({ isOpen: false, event: null })}
      />

      <AttendeeRosterModal
        isOpen={rosterModal.isOpen}
        event={rosterModal.event}
        onClose={() => setRosterModal({ isOpen: false, event: null })}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Event"
        message={`Are you sure you want to permanently delete "${deleteModal.event?.title}"? All existing registrations and bookmarks will also be deleted.`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, event: null })}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
