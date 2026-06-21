import { TravelPackage } from '../types';

export const getPackages = async (): Promise<TravelPackage[]> => {
  const res = await fetch('/api/packages');
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json();
};

export const createPackage = async (token: string, pkg: Omit<TravelPackage, 'id' | 'slug'> & { slug?: string }): Promise<TravelPackage> => {
  const res = await fetch('/api/packages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(pkg)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create package');
  }
  return res.json();
};

export const updatePackage = async (token: string, id: string, pkg: Partial<TravelPackage>): Promise<TravelPackage> => {
  const res = await fetch(`/api/packages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(pkg)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update package');
  }
  return res.json();
};

export const deletePackage = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`/api/packages/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete package');
  }
};

export const getAdminBookings = async (token: string): Promise<any[]> => {
  const res = await fetch('/api/admin/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch bookings');
  }
  return res.json();
};

export const updateBookingStatus = async (token: string, id: string, status: 'Pending' | 'Confirmed' | 'Cancelled'): Promise<any> => {
  const res = await fetch(`/api/admin/bookings/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update booking status');
  }
  return res.json();
};
