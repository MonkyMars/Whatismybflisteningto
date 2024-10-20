import type { NextPage } from "next";
import React, { useEffect } from "react";
import Head from "next/head";
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

const Home: NextPage = () => {
  const [timestamp, setTimestamp] = React.useState("0:00");
  const [progress, setProgress] = React.useState(60);
  const [next, setNext] = React.useState(true);
  const router = useRouter();
  const [token, setToken] = React.useState<string>("");
  const [song, setSong] = React.useState<Song>({
    title: "",
    artist: "",
    maxLength: "",
    timestamp: "",
    albumImage: "/default.bmp",
    href: "",
    id: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    const fetchSong = async () => {
      if (!accessToken) return;
      if (next) {
        try {
          const response = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response.status === 204) {
            console.log("No song currently playing");
            return;
          } else if (response.status === 401) {
            setToken("");
          }
          if(response.ok){
            const data = await response.json();
            if (data && accessToken) {
              setToken(accessToken);
          }
          if (data?.item) {
            const newSong: Song = {
              title: data.item.name,
              artist: data.item.artists
                .map((artist: any) => artist.name)
                .join(", "),
              maxLength: new Date(data.item.duration_ms)
                .toISOString()
                .substr(14, 5),
              timestamp: new Date(data.progress_ms).toISOString().substr(14, 5),
              albumImage:
                data.item.album.images[0]?.url || "/default-cover.png",
              href: data.item?.external_urls.spotify,
              id: data.item.id,
            };
            setSong(newSong);
            setTimestamp(newSong.timestamp);
          }
          } else {
            setToken("");
          }
        } catch (error) {
          console.error("Error fetching song:", error);
        } finally {
          setNext(false);
        }
      }
    };

    fetchSong();
  }, [token, next]);

  useEffect(() => {
    if (token) {
      const updateTimestamp = () => {
        const [minutes, seconds] = timestamp.split(":").map(Number);
        let updatedSeconds = seconds + 1;
        let updatedMinutes = minutes;

        if (updatedSeconds >= 60) {
          updatedSeconds = 0;
          updatedMinutes += 1;
        }
        const [minutesD, secondsD] = song.maxLength.split(":");
        const durationMinutes = parseInt(minutesD);
        const durationSeconds = parseInt(secondsD);
        if (
          updatedMinutes === durationMinutes &&
          updatedSeconds >= durationSeconds
        ) {
          setNext(true);
        }
        setTimestamp(
          `${updatedMinutes}:${updatedSeconds.toString().padStart(2, "0")}`
        );
      };
      const intervalId = setInterval(updateTimestamp, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timestamp, song.maxLength, token]);

  // Store the song every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (song.id) {
        updateGirlfriend();
      }
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [song]);

  const updateGirlfriend = async () => {
    const userID = 'gf';
    const songID = song.id;
    await fetch('/api/storeSong', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ songID, userID }),
    });
  };

  return (
    <>
      <Head>
        <title>{"What is my bf listening to?"}</title>
      </Head>
      <nav className={styles.nav}>
        {!token && (
          <button onClick={() => router.push("/api/login")}>{"Login"}</button>
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
          <div className={styles.timestamps}>
            <label>0{timestamp}</label>
            <span style={{ width: progress + "%" }}></span>
            <label>{song.maxLength}</label>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
