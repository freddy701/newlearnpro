"use client";
import { useEffect, useState } from "react";
import { LucideSend, LucideRefreshCw, LucideUsers, LucideMessageSquare } from "lucide-react";

export default function StudyGroupWidget({ courseId }: { courseId: number }) {
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroup = async () => {
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
  };

  useEffect(() => {
    if (courseId) fetchGroup();
  }, [courseId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroup();
    setRefreshing(false);
  };

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

  if (loading) {
    return (
      <div className="my-6 p-6 border rounded-lg bg-white shadow-md">
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-6 border rounded-lg bg-white shadow-md">
        <div className="flex flex-col items-center justify-center h-40">
          <div className="text-red-600 mb-2">⚠️ {error}</div>
          <button 
            onClick={fetchGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="my-6 p-6 border rounded-lg bg-white shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          <div className="bg-blue-100 p-2 rounded-full">
            <LucideUsers className="h-5 w-5 text-blue-600" />
          </div>
          Groupe d'étude
        </h2>
        <button 
          onClick={handleRefresh} 
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          disabled={refreshing}
          title="Rafraîchir"
        >
          <LucideRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Section des membres */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <LucideUsers className="h-4 w-4" /> 
          Membres ({group.members.length})
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {group.members.map((member: any) => (
            <div 
              key={member.user.id} 
              className="flex items-center gap-2 bg-gray-50 border rounded-full px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                {member.user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700">{member.user.fullName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section des messages */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <LucideMessageSquare className="h-4 w-4" /> 
          Conversation
        </div>
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto border">
          {group.messages && group.messages.length > 0 ? (
            <ul className="space-y-3">
              {group.messages.map((msg: any) => (
                <li key={msg.id} className="group flex gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-medium">
                    {msg.sender.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-gray-800">{msg.sender.fullName}</span>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(msg.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{msg.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <LucideMessageSquare className="h-10 w-10 mb-2" />
              <p>Aucun message dans ce groupe</p>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'envoi de message */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full border rounded-full px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Écrivez votre message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending}
          />
        </div>
        <button 
          type="submit" 
          className="px-4 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
          disabled={sending || !message.trim()}
        >
          {sending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Envoi...</span>
            </>
          ) : (
            <>
              <LucideSend className="h-4 w-4" />
              <span>Envoyer</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
