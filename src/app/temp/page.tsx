"use client"

import { useEffect } from "react";
import { setUserLocation } from "src/server/actions/location";

export default function Temp() {

  useEffect(() => {
    setUserLocation({
      lat: 63.4123,
      long: 10.4873,
      address: "Dalheimslyngen 11"
    })
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      Hola
    </div>
  );
}
