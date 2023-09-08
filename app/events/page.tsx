"use client"
import { fetcher } from "@/public/functions/converters";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import Event from "@/components/interfaces/Event"
import EventTable from "@/components/Events/EventTable";
import Footer from "@/components/Footer";

export default function Events() {
  const { data: events, error, isLoading } = useSWR<Event[]>("/api/get-events", fetcher)
  const searchParams = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (searchParams && !error && !isLoading && events) {
      const foundEvent = events.filter((e: any) => e._id === searchParams.get("eventId"));
      if (foundEvent.length === 1) {
        setSelectedEvent(foundEvent[0] as Event);
      }
    }
  }, [searchParams, error, events, isLoading])

  if (error || (!isLoading && !events)) return <div>Failed to load</div>
  if (isLoading || !searchParams || !events) return <div>Loading...</div>
  if (searchParams && !selectedEvent && searchParams.get("eventId") !== null) return <div>Invalid event id</div>

  return (
    <>
      <div className="pt-8">
        {selectedEvent && (
          <div className="pb-2 max-w-md">
            <h1 className="px-4 text-5xl md:text-7xl font-semibold">{selectedEvent.name}</h1>
            <p className="pt-4 invisible md:visible">
              {(new Date(selectedEvent.starts[0] * 1000)).toLocaleDateString("en-us")} - {(new Date(selectedEvent.ends[selectedEvent.ends.length-1] * 1000)).toLocaleDateString("en-us")}
            </p>
          </div>
        )}
        <div>
          <select
            placeholder="Choose a tournament"
            onChange={evt => setSelectedEvent(events.filter((e: any) => e._id === evt.target.value)[0])}
            className="
              bg-gray-50 border border-gray-300
              text-gray-900 text-sm rounded-lg
              block w-full p-2.5 dark:bg-gray-700
              dark:border-gray-600 dark:placeholder-gray-400
              dark:text-white">
            {
              events.map(e => (<option value={e._id} key={e._id}>{e.name}</option>))
            }
          </select>
        </div>
      </div>
      { !selectedEvent ? <p>Please select an event.</p> : <EventTable event={selectedEvent} /> }
      <Footer>
        <p>Contact Specnr on Discord to host an event</p>
      </Footer>
    </>
  );
}