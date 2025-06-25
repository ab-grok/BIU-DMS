export default function Requests() {
  function getVERequests() {
    const { dbRequests, tbRequests } = await getRequests();
  }
  return <div>view requests</div>;
}
