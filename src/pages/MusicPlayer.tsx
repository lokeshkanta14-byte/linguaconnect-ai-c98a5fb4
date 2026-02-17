import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat, Volume2 } from "lucide-react";

const songs = [
  { id: 1, title: "Naatu Naatu", artist: "Rahul Sipligunj", duration: "3:24", liked: true },
  { id: 2, title: "Jai Ho", artist: "A.R. Rahman", duration: "5:19", liked: false },
  { id: 3, title: "Tum Hi Ho", artist: "Arijit Singh", duration: "4:22", liked: true },
  { id: 4, title: "Butta Bomma", artist: "Armaan Malik", duration: "3:36", liked: false },
  { id: 5, title: "Chaiyya Chaiyya", artist: "Sukhwinder Singh", duration: "6:47", liked: true },
  { id: 6, title: "Samajavaragamana", artist: "Sid Sriram", duration: "4:15", liked: false },
];

const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress] = useState(35);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 py-3">
        <h1 className="text-xl font-bold font-display">Music</h1>
      </div>

      {/* Now Playing */}
      <div className="mx-4 mt-4 bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{songs[current].title}</h3>
            <p className="text-xs text-muted-foreground">{songs[current].artist}</p>
            {/* Progress bar */}
            <div className="mt-2.5 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">1:12</span>
              <span className="text-[10px] text-muted-foreground">{songs[current].duration}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 mt-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            className="text-foreground hover:text-primary transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => setCurrent(Math.min(songs.length - 1, current + 1))}
            className="text-foreground hover:text-primary transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Playlist */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Playlist</h2>
        <div className="space-y-1">
          {songs.map((song, i) => (
            <button
              key={song.id}
              onClick={() => { setCurrent(i); setPlaying(true); }}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors animate-fade-in ${
                i === current ? "bg-primary/10" : "hover:bg-secondary/50"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                i === current ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i === current && playing ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${i === current ? "text-primary" : ""}`}>{song.title}</p>
                <p className="text-xs text-muted-foreground">{song.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground mr-1">{song.duration}</span>
              <Heart className={`w-4 h-4 flex-shrink-0 ${song.liked ? "fill-sos text-sos" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
