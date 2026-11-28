import { useState } from "react";
import { resolveApiAsset } from "@/libs/config";
import styles from "./RecordThumbnail.module.scss";

export default function RecordThumbnail({
  image,
  name,
  portrait = false,
}: {
  image?: string | null;
  name: string;
  portrait?: boolean;
}) {
  const source = resolveApiAsset(image);
  const [failed, setFailed] = useState("");
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "MN";
  return (
    <span
      className={`${styles.thumbnail} ${portrait ? styles.portrait : ""}`}
      aria-hidden="true"
    >
      {source && failed !== source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          decoding="async"
          width={44}
          height={44}
          onError={() => setFailed(source)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}
