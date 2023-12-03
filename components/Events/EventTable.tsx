import useSWR from "swr";

import Event from "@/components/interfaces/Event";
import { fetcher } from "@/public/functions/converters";
import TableHeader from "@/components/TableHeader";
import Completion from "@/components/interfaces/Completion";
import CompletionEntry from "../CompletionEntry";
import Loading from "../Loading";

export default function EventTable({ event }: { event: Event }) {
  const { data, isLoading, error } = useSWR(
    `/api/get-event-completions?eventId=${event._id}`,
    fetcher
  );

  if (isLoading || !data)
    return (
      <div className="grid h-4/6 place-items-center">
        <Loading />
      </div>
    );

  return error || data.length === 0 ? (
    <div className="grid h-4/6 place-items-center">
      There are no completions yet...
    </div>
  ) : (
    <div className="mt-4 mx-auto half-height overflow-y-auto w-full md:w-2/4">
      <table className="relative text-lg text-left text-gray-400 justify-between w-full">
        <thead className="sticky top-0 text-sm uppercase bg-gray-700 text-gray-400">
          <tr>
            <TableHeader>Placement</TableHeader>
            <TableHeader colSpan={2}>Player</TableHeader>
            <TableHeader>Time</TableHeader>
          </tr>
        </thead>
        <tbody>
          {data.map((completion: Completion, idx: number) => (
            <CompletionEntry
              key={idx}
              placement={idx + 1}
              nickname={completion.nickname}
              uuid={completion.uuid}
              time={completion.time}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
