'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Search, Plus } from 'lucide-react';
import TopBar from '@/components/TopBar';
import AssignmentCard from '@/components/AssignmentCard';
import EmptyState from '@/components/EmptyState';
import { useAssignmentStore } from '@/store/assignmentStore';

export default function AssignmentsPage() {
  const router = useRouter();
  const {
    assignments,
    isLoading,
    error,
    searchQuery,
    fetchAssignments,
    deleteAssignment,
    setSearchQuery,
    clearError,
  } = useAssignmentStore();

  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
      fetchAssignments(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, fetchAssignments, setSearchQuery]);

  const handleView = useCallback((id: string) => {
    const assignment = assignments.find(a => a._id === id);
    if (assignment?.status === 'completed') {
      router.push(`/paper/${id}`);
    } else {
      router.push(`/create?edit=${id}`);
    }
  }, [assignments, router]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(id);
    }
  }, [deleteAssignment]);

  const handleCreateClick = () => {
    router.push('/create');
  };

  // Dismiss error after 5s
  useEffect(() => {
    if (error) {
      const t = setTimeout(clearError, 5000);
      return () => clearTimeout(t);
    }
  }, [error, clearError]);

  return (
    <>
      <TopBar title="Assignment" />

      {error && <div className="error-toast">{error}</div>}

      <div className="page-content">
        {isLoading && assignments.length === 0 ? (
          <div className="page-loading">
            <div className="spinner" />
          </div>
        ) : assignments.length === 0 && !localSearch ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          <>
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title-row">
                <div className="page-status-dot" />
                <h1 className="page-title">Assignments</h1>
              </div>
              <p className="page-subtitle">
                Manage and create assignments for your classes.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <button className="filter-btn">
                <Filter size={14} />
                Filter By
              </button>
              <div className="search-input-wrapper">
                <span className="search-icon"><Search size={14} /></span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search Assignment"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Assignment Grid */}
            <div className="assignments-grid">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Floating Action Button */}
            <button className="fab" onClick={handleCreateClick}>
              <Plus size={20} />
              Create Assignment
            </button>
          </>
        )}
      </div>
    </>
  );
}
