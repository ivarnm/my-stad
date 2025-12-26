"use client";

import { WeatherForecast, WeatherAlert } from "src/server/actions/weather";
import Image from 'next/image';
import { useState } from "react";
import Dialog from "src/components/ui/Dialog";
import AlertInfo from "./AlertInfo";

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "Moderate":
      return "bg-yellow-900/30 border-yellow-500 text-yellow-100";
    case "Severe":
      return "bg-orange-900/30 border-orange-500 text-orange-100";
    case "Extreme":
    case "Ultra":
      return "bg-red-900/30 border-red-500 text-red-100";
    default: // Minor
      return "bg-yellow-900/30 border-yellow-500 text-yellow-100";
  }
};

export default function WeatherAlerts({ alerts }: { alerts: WeatherForecast["alerts"] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  const allAlerts = [...alerts.ongoing, ...alerts.expected];
  const hasMultipleAlerts = allAlerts.length > 1;

  const handleClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedAlert(null), 300); // Wait for animation
  };

  const handleAlertClick = (alert: WeatherAlert) => {
    setSelectedAlert(alert);
  };

  const renderAlertBox = (alert: WeatherAlert) => (
    <button
      key={alert.id}
      onClick={() => handleAlertClick(alert)}
      className={`w-full text-left p-4 rounded-lg border mb-3 transition-transform hover:scale-[1.01] flex items-center gap-4 ${getSeverityStyles(
        alert.severity
      )}`}
    >
      <Image
        src={`https://nrkno.github.io/yr-warning-icons/png/${alert.warningIcon}`}
        alt={alert.title}
        width={40}
        height={40}
        className="shrink-0"
      />
      <div>
        <h3 className="font-bold text-lg">{alert.title}</h3>
        <p className="text-sm opacity-90">{alert.severity}</p>
      </div>
    </button>
  );

  const renderContent = () => {
    // Case 1: Single alert - show it directly
    if (!hasMultipleAlerts && allAlerts.length > 0) {
      return <AlertInfo alert={allAlerts[0]} />;
    }

    // Case 2: Multiple alerts, one selected - show detail with back button
    if (selectedAlert) {
      return (
        <div>
          <button
            onClick={() => setSelectedAlert(null)}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-(--text-subtle) hover:text-foreground transition-colors border border-(--text-subtle) hover:border-foreground rounded px-3 py-1"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
            <span>Back</span>
          </button>
          <AlertInfo alert={selectedAlert} />
        </div>
      );
    }

    // Case 3: Multiple alerts, list view
    return (
      <div className="space-y-6">
        {alerts.ongoing.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Ongoing
            </h3>
            <div className="space-y-2">
              {alerts.ongoing.map(renderAlertBox)}
            </div>
          </div>
        )}

        {alerts.expected.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Expected
            </h3>
            <div className="space-y-2">
              {alerts.expected.map(renderAlertBox)}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (allAlerts.length === 0) return null;

  return (
    <div>
      <button
        className="flex gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsDialogOpen(true)}
        aria-label="View weather alerts"
      >
        {allAlerts.map((alert) => (
          <Image
            key={alert.id}
            src={`https://nrkno.github.io/yr-warning-icons/png/${alert.warningIcon}`}
            alt={alert.title}
            width={24}
            height={24}
          />
        ))}
      </button>
      <Dialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        title={selectedAlert ? selectedAlert.title : "Weather Alerts"}
      >
        {renderContent()}
      </Dialog>
    </div>
  );
}
