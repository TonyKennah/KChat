plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
    id("com.gradleup.shadow") version "8.3.0" 
}

group = "uk.co.kennah"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    // Redis Client
    implementation("io.lettuce:lettuce-core:6.3.2.RELEASE")

    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.websockets)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.config.yaml)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test.junit)
}

tasks.shadowJar {
    archiveClassifier.set("all") // Creates KChat-0.0.1-all.jar
    mergeServiceFiles()           // Merges META-INF/services (Crucial for Ktor!)
    
    // Optional: if you want the jar to have a simpler name
    archiveFileName.set("KChat.jar")
}

// 1. A standard Exec task that runs the 'npm run build' command
val buildFrontend by tasks.registering(Exec::class) {
    group = "build"
    workingDir = file("frontend")
    
    // This handles the difference between Windows (npm.cmd) and Mac/Linux (npm)
    val isWindows = org.apache.tools.ant.taskdefs.condition.Os.isFamily(org.apache.tools.ant.taskdefs.condition.Os.FAMILY_WINDOWS)
    commandLine(if (isWindows) listOf("npm.cmd", "run", "build") else listOf("npm", "run", "build"))
    
    // Optimization: Only run if the source files change
    inputs.dir(file("frontend/src"))
    outputs.dir(file("frontend/dist"))
}

// 2. A standard Copy task to move the results
val copyFrontendToResources by tasks.registering(Copy::class) {
    dependsOn(buildFrontend)
    from("frontend/dist")
    into("src/main/resources/static")
}

// 3. Hook into the build lifecycle
tasks.processResources {
    dependsOn(copyFrontendToResources)
}

tasks.shadowJar {
    dependsOn(tasks.processResources)
}