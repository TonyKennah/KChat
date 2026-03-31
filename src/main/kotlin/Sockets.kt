package uk.co.kennah

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import java.time.Duration
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.time.Duration.Companion.seconds

fun Application.configureSockets() {
    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 15.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }
    routing {
        webSocket("/chat") {
            // A. Track the new connection
            ChatManager.activeSessions[this] = "Anonymous..."
            
            // B. Send history to the user who just joined
            ChatManager.messageHistory.forEach { msg ->
                send(Json.encodeToString(msg))
            }

            try {
                for (frame in incoming) {
                    if (frame is Frame.Text) {
                        val json = frame.readText()
                        val msg = Json.decodeFromString<ChatMessage>(json)
                        
                        // If this is the first message or name changed, update map and list
                        if (ChatManager.activeSessions[this] != msg.sender) {
                            ChatManager.activeSessions[this] = msg.sender
                            ChatManager.broadcastUserList()
                        }

                        // C. Tell the Manager to tell everyone else
                        ChatManager.broadcast(msg)
                    }
                }
            } finally {
                // D. Clean up when they leave
                ChatManager.activeSessions.remove(this)
                ChatManager.broadcastUserList()
            }
        }
    }
}
