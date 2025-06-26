import Loading from "@/components/loading";
import { getRequests } from "@/lib/server";

export default function Requests() {
  function getVERequests() {
    // const { dbRequests, tbRequests } = getRequests();
  }
  return (
    <div>
      <Loading />
      view requests
    </div>
  );
}
