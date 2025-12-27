"use client";

import React, { useActionState, useState } from 'react';
import { UserLocation, saveUserLocation } from 'src/server/actions/location';
import Card from 'src/components/ui/Card';

const TRANSIT_STOPS = [
  "Jernbanetorget",
  "Nationaltheatret",
  "Majorstuen",
  "Sinsen",
  "Brynseng"
];

export default function UserSettings({ location }: { location: UserLocation | null }) {
  const [formValues, setFormValues] = useState({
    address: location?.address || '',
    lat: location?.lat?.toString() || '',
    long: location?.long?.toString() || '',
  });
  const [state, formAction, isPending] = useActionState(saveUserLocation, { message: '' });

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
      // limit to 4 decimal places
      const floatValue = parseFloat(value);
      if (!isNaN(floatValue)) {
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
            className="text-xs text-(--fill-default) hover:underline"
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
        <div className="flex flex-col gap-2 bg-(--surface-muted) p-2 rounded">
          {TRANSIT_STOPS.map(stop => (
            <label key={stop} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="transitStops"
                value={stop}
                defaultChecked={location?.transitStops?.includes(stop)}
                className="accent-(--fill-default)"
              />
              <span className="text-sm">{stop}</span>
            </label>
          ))}
        </div>
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
