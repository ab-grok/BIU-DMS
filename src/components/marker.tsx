type marker = {
  hovered: boolean;
  selectContext: string; //accounts only for selections formatted with id?path
  size?: number;
  uPath: string; //selectedTbUsers: userId?db/tb || db/tb for tables.
};

export default function Marker({
  hovered,
  selectContext,
  uPath,
  size,
}: marker) {
  const sz = size ? `size-${size}` : "size-3";
  const sz2 = size ? `size-${size - 1}` : "size-2";

  return (
    <div
      className={`${sz} ${hovered || selectContext?.includes(uPath) ? "flex" : "hidden"} flex items-center justify-center rounded-full ring-1 ring-red-800`}
    >
      <div
        className={`${sz2} ${selectContext?.includes(uPath) ? "bg-red-600 shadow-xs" : "bg-red-600/10"} flex rounded-full`}
      ></div>
    </div>
  );
}
