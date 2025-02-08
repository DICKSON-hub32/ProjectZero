import React, { Component } from "react";
import { useState } from "react";
import MessageInput from "../Components/MessageInput";
import Message from "../Components/Messages";

export default function AiMessages() {
    return (<div>
    <Message/>
    <MessageInput/>
    </div>)
}

