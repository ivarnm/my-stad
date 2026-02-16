"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { UserLocation, saveUserLocation } from 'src/server/actions/location';
import TransitStopSelector from './TransitStopSelector';
import { TransitStop } from 'src/server/actions/transit';

export default function UserSettings({ location }: { location: UserLocation | null }) {
  const [state, formAction, isPending] = useActionState(saveUserLocation, { message: '' });
  const [formValues, setFormValues] = useState({
    address: location?.address || '',
    lat: location?.lat?.toString() || '',
    long: location?.long?.toString() || '',
    transitStops: location?.transitStops || []
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (location && !cancelled) {
        setFormValues({
          address: location.address,
          lat: location.lat.toString(),
          long: location.long.toString(),
          transitStops: location.transitStops || []
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location]);


  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormValues(prev => ({
          ...prev,
          lat: position.coords.latitude.toFixed(4).toString(),
          long: position.coords.longitude.toFixed(4).toString()
        }));
      }, (error) => {
        console.error("Error getting location:", error);
        alert("Could not get location. Please enter manually.");
      });
    } else {
      alert("Geolocation is not available in your browser.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'lat' || name === 'long') {
      const floatValue = parseFloat(value);
      if (!isNaN(floatValue) && value.includes('.') && value.split('.')[1].length > 4) {
        const fixedValue = floatValue.toFixed(4);
        setFormValues(prev => ({
          ...prev,
          [name]: fixedValue
        }));
        return;
      }
    }

    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransitStopChange = (stop: TransitStop) => {
    setFormValues(prev => {
      const stops = prev.transitStops.some(s => s.id === stop.id)
        ? prev.transitStops.filter(s => s.id !== stop.id)
        : [...prev.transitStops, stop];
      return { ...prev, transitStops: stops };
    });
  };

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md mx-auto">
      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium text-(--text-subtle)">Address</label>
        <input
          id="address"
          name="address"
          type="text"
          value={formValues.address}
          onChange={handleInputChange}
          required
          className="border rounded p-2 bg-(--surface-muted) border-transparent focus:border-(--fill-default) outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-(--text-subtle)">Location</label>
          <button
            type="button"
            onClick={handleGetLocation}
            className="text-xs text-(--text-secondary) hover:underline"
          >
            Get Current Location
          </button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              name="lat"
              type="number"
              placeholder="Latitude"
              value={formValues.lat}
              onChange={handleInputChange}
              required
              className="w-full border rounded p-2 bg-(--surface-muted) border-transparent focus:border-(--fill-default) outline-none"
            />
          </div>
          <div className="flex-1">
            <input
              name="long"
              type="number"
              placeholder="Longitude"
              value={formValues.long}
              onChange={handleInputChange}
              required
              className="w-full border rounded p-2 bg-(--surface-muted) border-transparent focus:border-(--fill-default) outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-(--text-subtle)">Transit Stops</label>
        <TransitStopSelector
          lat={formValues.lat}
          long={formValues.long}
          selectedStops={formValues.transitStops.map(stop => stop.id)}
          onStopChange={handleTransitStopChange}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-(--fill-default) text-white rounded p-2 font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Saving...' : 'Save Settings'}
      </button>
      {state?.message && (
        <p className="text-green-500 text-sm text-center">{state.message}</p>
      )}
    </form>
  )
}
