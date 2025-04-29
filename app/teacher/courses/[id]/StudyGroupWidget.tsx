"use client";
import { useEffect, useState } from "react";

export default function StudyGroupWidget({ courseId }: { courseId: number }) {
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/courses/${courseId}/study-group`);
        if (!res.ok) throw new Error("Groupe d'étude introuvable");
        const data = await res.json();
        setGroup(data.studyGroup);
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchGroup();
  }, [courseId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/study-group/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi du message");
      setMessage("");
      // Rafraîchir les messages
      const data = await res.json();
      setGroup((g: any) => ({ ...g, messages: [data.message, ...(g.messages || [])].slice(0, 20) }));
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="my-4">Chargement du groupe d'étude...</div>;
  if (error) return <div className="my-4 text-red-600">{error}</div>;
  if (!group) return null;

  return (
    <div className="my-6 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <span>👥</span> Groupe d'étude
      </h2>
      <div className="mb-2 text-sm text-gray-700">Membres ({group.members.length}) :</div>
      <ul className="flex flex-wrap gap-2 mb-3">
        {group.members.map((member: any) => (
          <li key={member.user.id} className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs">
            {member.user.profilePictureUrl && (
              <img src={member.user.profilePictureUrl} alt={member.user.fullName} className="w-6 h-6 rounded-full" />
            )}
            <span>{member.user.fullName}</span>
          </li>
        ))}
      </ul>
      {group.messages && group.messages.length > 0 && (
        <div>
          <div className="text-sm text-gray-700 mb-1">Derniers messages :</div>
          <ul className="space-y-1 mb-2">
            {group.messages.map((msg: any) => (
              <li key={msg.id} className="bg-white border rounded p-2 text-xs">
                <span className="font-semibold">{msg.sender.fullName} :</span> {msg.content}
                <span className="ml-2 text-gray-400">{new Date(msg.sentAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Formulaire d'envoi de message */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1 text-xs"
          placeholder="Votre message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs" disabled={sending || !message.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
