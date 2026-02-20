"use client";

import { useCallback, useEffect, useState } from "react";

import { IForm } from "@/common/interfaces/form.interfaces";

export function ExpirationTimer({ form }: { form: IForm }) {
    const calculateExpirationTime = useCallback(() => {
        // This function calculates the remaining time until form expiration, returning
        // an object with days, hours, minutes, and seconds.
        function getExpirationTimestampFromURL() {
            if (!form.metadata.formExpiration) return null;
            // Try to parse timestamp from URL. Use window.location if available.
            if (typeof window === 'undefined') return null;
            // Look for the query key in the URL
            const queryKey = form.metadata.formExpirationQueryKey || "ts";
            const queryParams = new URLSearchParams(window.location.search);
            const expirationTimestamp = queryParams.get(queryKey);
            if (!expirationTimestamp) return null;
            // Timestamp might be in the format XXX-{timestamp} (e.g., ts=Y-1710958684671)
            const timestampPart = `${expirationTimestamp}`.split("-").pop();
            const timestamp = parseInt(timestampPart || "0", 10);
            if (!timestamp || isNaN(timestamp)) return null;
            return timestamp;
        }

        const now = Date.now();
        const baseTimestamp = getExpirationTimestampFromURL();

        if (!baseTimestamp) {
            // Invalid or missing timestamp: return 0 everywhere.
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        const expirationDays = form.metadata.formExpirationDays || 30;
        const expirationDate = new Date(baseTimestamp + expirationDays * 24 * 60 * 60 * 1000);

        let diff = expirationDate.getTime() - now;
        diff = Math.max(diff, 0);

        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);

        return {
            days,
            hours,
            minutes,
            seconds,
        };
    }, [form.metadata.formExpiration, form.metadata.formExpirationDays, form.metadata.formExpirationQueryKey]);

    const [expiresIn, setExpiresIn] = useState(() => calculateExpirationTime());

    const formatTimer = useCallback((time: { days: number; hours: number; minutes: number; seconds: number }) => {
        let timeString = "";
        if (time.days > 0) timeString += `${time.days.toString().padStart}d `;
        if (time.hours > 0) timeString += `${time.hours.toString().padStart(2, '0')}h `;
        if (time.minutes > 0) timeString += `${time.minutes.toString().padStart(2, '0')}m `;
        if (time.seconds > 0) timeString += `${time.seconds.toString().padStart(2, '0')}s `;
        return timeString;
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setExpiresIn(calculateExpirationTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [calculateExpirationTime]);

    if (!form.metadata.formExpiration) {
        return null;
    }

    return (
        <div className="md:flex md:items-center md:gap-2 block">
            <div className="text-xs md:text-base">
                Expires In:
            </div>
            <div className="text-sm md:text-base">
                <p>{formatTimer(expiresIn)}</p>
            </div>
        </div>
    );
}