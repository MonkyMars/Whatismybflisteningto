import React from "react";
import styles from "../styles/Wallpaper.module.scss";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import Image from "next/image";
interface Song {
  title: string;
  artist: string;
  maxLength: string;
  timestamp: string;
  albumImage: string;
  href: string;
  id: string;
}

const Wallpaper: NextPage = () => {
  const [next, setNext] = React.useState(true);
  const [token, setToken] = React.useState(false);
  const [timestamp, setTimestamp] = React.useState("0:00");
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();
  const [color, setColor] = React.useState({songTitleColor: '', artistColor: null})
  const [song, setSong] = React.useState<Song>({
    title: "",
    artist: "",
    maxLength: "",
    timestamp: "",
    albumImage: "/default.bmp",
    href: "",
    id: "",
  });


  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if(accessToken) {
      setToken(true)
    } else {
      setToken(false)
    }
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
            setToken(false);
          }
          if(response.ok){
            const data = await response.json();
            console.log(data)
            if (data && accessToken) {
              setToken(true);
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
            setToken(false);
          }
        } catch (error) {
          console.error("Error fetching song:", error);
        } finally {
          setNext(false);
        }
      }
    };
    const fetchMainColor = async() => {
      const result = await fetch(`/api/albumcover-color?imageUrl=${song.albumImage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await result.json();
      const matchingColor = getMatchingColor(data.dominantColor);
      const shadeOfGrey = getGrayShades(data.dominantColor)
      setColor({songTitleColor: data.dominantColor, artistColor: matchingColor})
      console.log(data)
    }
    fetchMainColor();
    fetchSong();
  }, [next, token, song])

  React.useEffect(() => {
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

  React.useEffect(() => {
    const calculateProgress = () => {
      const [minutesDuration, secondsDuration] = song.maxLength.split(':');
      const [minutesCurrent, secondsCurrent] = timestamp.split(':');
      if(minutesCurrent !== '0') {
      const totalCurrent = (parseInt(minutesCurrent) * 60) + secondsCurrent;
      const totalDuration = (parseInt(minutesDuration) * 60) + secondsDuration;
      const progressBase100 = (parseInt(totalCurrent) / parseInt(totalDuration)) * 100;
      const progressBase70 = (progressBase100 * 0.7);
      const progress = progressBase70.toFixed(0)
      setProgress(parseInt(progress))
      } else if(minutesCurrent === '0') {
        const totalDuration = (parseInt(minutesDuration) * 60) + secondsDuration;
        const totalCurrent = secondsCurrent;
        const progressBase100 = (parseInt(totalCurrent) / parseInt(totalDuration)) * 10000;
        const progressBase70 = (progressBase100 * 0.7);
        const progress = progressBase70.toFixed(0);
        setProgress(parseInt(progress))
      }
    }
    calculateProgress();
  }, [timestamp, song])


  return (
    <>
        <nav className={styles.nav}>
          {!token && (
            <button onClick={() => router.push("/api/loginWallpaper")}>
              {"Login"}
            </button>
          )}
        </nav>
        <main className={styles.main}>

        <div className={styles.songInfo}>
          <div>
            <Image
              alt="Album cover"
              src={song.albumImage}
              width={2000}
              height={2000}
              priority
              draggable={false}
            />
            <div className={styles.songTitle}>
              <h1
                onClick={() =>
                  song.href
                    ? `${song.href}/?access_token=${encodeURIComponent(token)}`
                    : "#"
                }
                style={{color: color.songTitleColor}}
              >
                {song.title}
              </h1>

              <label style={{color: color.artistColor || '#fff'}}>{song.artist}</label>
            </div>
          </div>
          <div className={styles.timestamps}>
            <label style={{color: color.artistColor}}>0{timestamp}</label>
            <span style={{ width: progress + "%", backgroundColor: color.songTitleColor}}></span>
            <label style={{color: color.artistColor}}>{song.maxLength}</label>
          </div>
        </div>
      </main>
    </>
  );
};

export default Wallpaper;


function hexToHsl(hex: any) {
  if(hex) {
    hex = hex.replace(/^#/, '');

  // Parse the r, g, b values
  const bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  // Convert to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: any, s: any, l: any = (max + min) / 2;

  if (max === min) {
    h = s = 0; 
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
  }
}

function hslToHex(h: any, s: any, l: any) {
  if(h && s && l) {
s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r: any, g: any, b: any;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return `#${((1 << 24) + (Math.round((r + m) * 255) << 16) + (Math.round((g + m) * 255) << 8) + Math.round((b + m) * 255)).toString(16).slice(1).toUpperCase()}`;
  }
}

function getMatchingColor(hex: any) {
  if(hex) {
      const [h, s, l] = hexToHsl(hex);
  const newHue = (h + 30) % 360;
  const newSaturation = Math.min(100, s + 20);
  const newLightness = Math.max(20, l - 20); 
  
  return hslToHex(newHue, newSaturation, newLightness);
  }

}

function hexToRgb(hex: any) {
  if(hex) {
      hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
  }
}

function luminance(r: any, g: any, b: any) {
  if(r && g && b) {
     return 0.299 * r + 0.587 * g + 0.114 * b; 
  }
}

function contrastRatio(luminanceA: any, luminanceB: any) {
  if(luminanceA && luminanceB) {
    const ratio = (luminanceA + 0.05) / (luminanceB + 0.05);
    return ratio > 1 ? ratio : 1 / ratio; // Return the greater ratio
  }
}

function getGrayShades(dominantColor: any) {
  if(dominantColor) {
      const { r, g, b } = hexToRgb(dominantColor);
  const dominantLuminance = luminance(r, g, b) / 255; // Get luminance of the dominant color

  const grayShades = [
    '#F0F0F0', 
    '#D0D0D0',
    '#B0B0B0',
    '#909090',
    '#707070',
    '#505050',
    '#303030',
    '#101010' 
  ];

  const readableGrays = grayShades.filter(gray => {
    const { r: grayR, g: grayG, b: grayB } = hexToRgb(gray);
    const grayLuminance = luminance(grayR, grayG, grayB) / 255;
    const ratio = contrastRatio(dominantLuminance, grayLuminance);
    return ratio > 4.5;
  });

  return readableGrays;
  }
}