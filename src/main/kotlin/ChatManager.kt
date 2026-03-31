package uk.co.kennah

import io.ktor.websocket.*
import io.ktor.server.websocket.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class ChatMessage(val sender: String, val text: String)

@Serializable
data class UserListMessage(val type: String, val users: List<String>)

object ChatManager {
    // 1. Store the last 100 messages in RAM
    val messageHistory = ConcurrentLinkedQueue<ChatMessage>()
    
    // 2. Keep track of all active WebSocket sessions and their usernames
    val activeSessions = ConcurrentHashMap<DefaultWebSocketServerSession, String>()

    suspend fun broadcast(message: ChatMessage) {
        // Add to history (keep it under 100 messages to save RAM)
        messageHistory.add(message)
        if (messageHistory.size > 100) messageHistory.poll()

        // Turn object into JSON string
        val jsonString = Json.encodeToString(message)

        // Send to EVERYONE currently connected
        activeSessions.keys.forEach { session ->
            try {
                session.send(jsonString)
            } catch (e: Exception) {
                // Connection might be dead, it'll be cleaned up in Routing.kt
            }
        }
    }

    suspend fun broadcastUserList() {
        val userList = activeSessions.values.distinct()
        val jsonString = Json.encodeToString(UserListMessage("users", userList))
        
        activeSessions.keys.forEach { session ->
            try { session.send(jsonString) } catch (e: Exception) {}
        }
    }
}