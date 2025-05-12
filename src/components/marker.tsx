type marker = {
  hovered: number;
  selected: string; //accounts only for selections formatted with id?path
  size?: number;
  id: string;
  path: string; //db/tb for tables. satisfies selectedTbUsers: userId?db/tb
  n?: number;
};

export default function Marker({
  hovered,
  selected,
  path,
  size,
  id,
  n,
}: marker) {
  const sz = size ? `size-${size}` : "size-3";
  const sz2 = size ? `size-${size - 1}` : "size-2";

  return (
    <div
      className={`${sz} ${(n ? hovered == n : hovered) || selected?.includes(id + "?" + path) ? "flex" : "hidden"} flex items-center justify-center rounded-full ring-1 ring-red-800`}
    >
      <div
        className={`${sz2} ${selected?.includes(id) ? "bg-red-600 shadow-xs" : "bg-red-600/10"} flex rounded-full`}
      ></div>
    </div>
  );
}
