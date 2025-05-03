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
    <div className="my-4 sm:my-6 p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <span className="bg-blue-100 p-2 rounded-full">👥</span> 
        Groupe d'étude
      </h2>

      {/* Liste des membres */}
      <div className="mb-3">
        <div className="text-xs sm:text-sm text-gray-600 mb-2">
          Membres ({group.members.length})
        </div>
        <ul className="flex flex-wrap gap-2">
          {group.members.map((member: any) => (
            <li 
              key={member.user.id} 
              className="flex items-center gap-2 bg-gray-50 border rounded-full px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                {member.user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700">{member.user.fullName}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section des messages */}
      {group.messages && group.messages.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Conversation</div>
          <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {group.messages.map((msg: any) => (
                <li key={msg.id} className="group flex gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-medium">
                    {msg.sender.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm text-gray-800">{msg.sender.fullName}</span>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(msg.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{msg.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Écrivez votre message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={sending}
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
          disabled={sending || !message.trim()}
        >
          {sending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Envoi...</span>
            </>
          ) : (
            'Envoyer'
          )}
        </button>
      </form>
    </div>
  );
}
