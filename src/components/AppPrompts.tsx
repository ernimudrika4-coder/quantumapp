import { useEffect, useState } from "react";
import { Bell, Download, Share, Smartphone, X } from "lucide-react";
import { isAndroid, isiOS, isStandaloneMode, requestNotificationPermission, subscribeBrowserPush } from "../services/pwa";
import { backendGetPushPublicKey, postBackendPushSubscription } from "../services/backend";
import { useAuth } from "../context/AuthContext";
import { useApp } from "./UI";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function AppPrompts() {
  const { addToast } = useApp();
  const { isAuthenticated } = useAuth();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("quantum_prompt_dismissed") === "1");
  const [notifDismissed, setNotifDismissed] = useState(() => localStorage.getItem("quantum_notif_dismissed") === "1");
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const standalone = isStandaloneMode();
  const showInstall = !standalone && !dismissed && (!!installEvent || isiOS() || isAndroid());
  const showNotif = !notifDismissed && notifPermission !== "granted" && notifPermission !== "unsupported";

  return (
    <div className="px-4 space-y-2">
      {showInstall && (
        <div className="glossy-elevated rounded-2xl p-4 relative overflow-hidden fade-up">
          <button
            onClick={() => {
              setDismissed(true);
              localStorage.setItem("quantum_prompt_dismissed", "1");
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center touchable"
          >
            <X className="w-3.5 h-3.5 text-ink-500" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chrome-2 to-chrome-4 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
              <Smartphone className="w-5 h-5 text-bg-base relative" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px] text-chrome-bright mb-1">Pasang aplikasi ke layar utama</div>
              <div className="text-[12px] text-ink-500 leading-relaxed mb-3">
                Supaya terasa seperti APK dan bisa dibuka fullscreen dari home screen.
              </div>

              {installEvent ? (
                <button
                  onClick={async () => {
                    await installEvent.prompt();
                    const choice = await installEvent.userChoice;
                    if (choice.outcome === "accepted") {
                      addToast("Aplikasi berhasil dipasang ke homescreen", "success");
                      setInstallEvent(null);
                    }
                  }}
                  className="btn-primary text-[12px] px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Install Aplikasi
                </button>
              ) : isiOS() ? (
                <div className="text-[12px] text-ink-700 bg-bg-1/60 rounded-xl px-3 py-2.5 border border-white/5 inline-flex items-center gap-2">
                  <Share className="w-4 h-4 text-blue-400" />
                  Di iPhone: tap <b>Share</b> lalu <b>Add to Home Screen</b>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showNotif && (
        <div className="glossy rounded-2xl p-4 relative overflow-hidden fade-up">
          <button
            onClick={() => {
              setNotifDismissed(true);
              localStorage.setItem("quantum_notif_dismissed", "1");
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center touchable"
          >
            <X className="w-3.5 h-3.5 text-ink-500" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px] text-chrome-bright mb-1">Aktifkan notifikasi</div>
              <div className="text-[12px] text-ink-500 leading-relaxed mb-3">
                Dapatkan alert saat ada sinyal baru atau event ekonomi penting. Di iPhone, notifikasi web bekerja setelah app dipasang ke home screen.
              </div>
              <button
                onClick={async () => {
                  const permission = await requestNotificationPermission();
                  setNotifPermission(permission);
                  if (permission === "granted") {
                    if (isAuthenticated) {
                      const key = await backendGetPushPublicKey();
                      if (key?.publicKey) {
                        try {
                          const sub = await subscribeBrowserPush(key.publicKey);
                          if (sub) {
                            const json = sub.toJSON();
                            if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
                              await postBackendPushSubscription({
                                endpoint: json.endpoint,
                                keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
                                platform: 'web'
                              });
                            }
                          }
                        } catch {
                          // subscription optional for now
                        }
                      }
                    }
                    addToast("Notifikasi berhasil diaktifkan", "success");
                  } else {
                    addToast("Izin notifikasi ditolak", "error");
                  }
                }}
                className="btn-secondary text-[12px] px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
              >
                <Bell className="w-4 h-4" />
                Aktifkan Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
