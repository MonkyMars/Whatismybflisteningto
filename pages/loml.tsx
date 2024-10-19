import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.scss";
import { useRouter } from "next/router";

interface Song {
  title: string;
  artist: string;
  maxLength: string;
  timestamp: string;
  albumImage: string;
  href: string;
  id: string;
}

const Girlfriend: NextPage = () => {
  const [timestamp, setTimestamp] = useState("0:00");
  const [song, setSong] = useState<Song | null>(null);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [progress, setProgress] = useState(60);
  const [next, setNext] = useState(true);

  const fetchSongForGirlfriend = async () => {
    const userID = "gf";
    const response = await fetch(`/api/fetchSong/?userID=${userID}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.songID) {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        setToken(accessToken || "");
        const songDetailsResponse = await fetch(
          `https://api.spotify.com/v1/tracks/${data.songID}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (songDetailsResponse.ok) {
          const data = await songDetailsResponse.json();
          const song: Song = {
            title: data.name,
            artist: data.artists.map((artist: any) => artist.name).join(", "),
            maxLength: new Date(data.duration_ms).toISOString().substr(14, 5),
            timestamp: data.progress_ms
              ? new Date(data.progress_ms).toISOString().substr(14, 5)
              : "",
            albumImage: data.album.images[0]?.url || "/default-cover.png",
            href: data.external_urls.spotify,
            id: data.id,
          };
          setSong(song);
        }
      }
    }
  };

  useEffect(() => {
    fetchSongForGirlfriend();
    
    // Fetch song every 15 seconds
    const intervalId = setInterval(fetchSongForGirlfriend, 15000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  if (!song) {
    return (
      <>
        <nav className={styles.nav}>
          {!token && (
            <button onClick={() => router.push("/api/loginGF")}>
              {"Login"}
            </button>
          )}
        </nav>
        <div>Loading song...</div>
      </>
    );
  }

  return (
    <>
      <nav className={styles.nav}>
        {!token && (
          <button onClick={() => router.push("/api/loginGF")}>{"Login"}</button>
        )}
      </nav>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{"What is my bf listening to?"}</h1>
          <h2>{"Your bf is listening to:"}</h2>
        </header>

        <div className={styles.songInfo}>
          <div>
            <Image
              alt="Album cover"
              src={song.albumImage}
              width={200}
              height={200}
              priority
              draggable={false}
            />
            <div className={styles.songTitle}>
              <label
                onClick={() =>
                  song.href
                    ? `${song.href}/?access_token=${encodeURIComponent(token)}`
                    : "#"
                }
              >
                {song.title}
              </label>
              <label>{song.artist}</label>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Girlfriend;
