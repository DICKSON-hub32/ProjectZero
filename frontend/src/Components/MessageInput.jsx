import React, { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { addRequestResponse,addResponse} from "../Slices/aiMessagesSlice";
import { useDispatch,useSelector } from "react-redux";
import useGetAiMessages from "./FetchAiMessages";

export default function MessageInput() {
    const [isMounted,setMounted]=useState(false)
    const [message, setMessage] = useState("");
    const texts=useSelector((state)=>state.aiMessages.requests)
    const dispatch=useDispatch()
    const messagesContainer = document.querySelector(".messages");
    const [typing,setTyping]=useState(false)
    
    function createMessageDiv(sender, text, isPersonal, avatarPath) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message" + (isPersonal ? " message-personal" : "");
        const avatarHtml = `
            <figure class="avatar">
                <img src="${avatarPath}" alt="${sender}">
            </figure>`;
        const messageTextHtml = `
            <div class="message-text" tabindex="0">
                <div class="text">${text}</div>
                <div class="timestamp"><span class="assist"><p>${sender}</p></span><p class="time">${getCurrentTime(isPersonal)}</p></div>
            </div>`;
        messageDiv.innerHTML = isPersonal ? messageTextHtml + avatarHtml : avatarHtml + messageTextHtml;
        return messageDiv;
    }
   
    useEffect(()=>{
     function t(){
        texts.forEach((messageObj)=>{
            console.log(messageObj.request,'requesssss')
            // const messageDiv = createMessageDiv("You", messageObj.request, true, "react.svg");
            addMessage("You", messageObj.request, true, false)
            // console.log(messageDiv);
            // document.querySelector(".messages").appendChild(messageDiv);
            const responses = messageObj.response[0];
            // const responseDiv = createMessageDiv("VA", responses, false, "react.svg");
            addMessage("VA", responses, false, false)
            document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
            })
        };t()
     } ,[])

    function handleChange(event) {
        setMessage(event.target.value);
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getCurrentTime(isPersonal) {
        const now = new Date();
        if (isPersonal){
            const time = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return time;
        }
        return formatTime(now);
    }

    function parseText(text) {
        // Define patterns for different types of elements
        const patterns = [
            { type: 'link', regex: /<a href="[^"]+">[^<]+<\/a>/ }, // Matches HTML anchor tags
            { type: 'header', regex: /###([^#]+)###/ },            // Matches custom header format ###header###
            { type: 'subheader', regex: /\*\*\*([^*]+)\*\*\*/ },   // Matches custom subheader format ***subheader***
            { type: 'ol', regex: /-#([^#]*)-#/ },                  // Matches custom ordered list item format -#item-#
            { type: 'ul', regex: /-\*([^*]*)-\*/ },                // Matches custom unordered list item format -*item-*
            { type: 'reset', regex: /!\|/ },                       // Matches custom reset sequence £|
            { type: 'override', regex: /!\d+\|/ },                  // Matches custom override sequence |
            { type: 'expl', regex: /-\|([^\|]*)-\|/ }                  // Matches custom explanation |
        ];

        let elements = [];  // Array to hold the parsed elements
        let index = 0;      // Current position in the text
        let olIndex = 1;    // Current ordered list index

        // Loop through the text until the end
        while (index < text.length) {
            let matched = false;

            // Check each pattern to see if it matches the current position in the text
            for (const { type, regex } of patterns) {
                const match = regex.exec(text.slice(index));
                if (match && match.index === 0) {
                    let elementText = match[0];

                    // Handle reset sequence
                    if (type === 'reset') {
                        olIndex = 1;  // Reset ordered list index
                        elements.push({ type, match: elementText, index });
                        index += match[0].length; // Move index past the matched element
                        matched = true;
                        break;
                    }

                    // Handle override sequence
                    if (type === 'override') {
                        // Extract the new olIndex from the override sequence
                        olIndex = parseInt(elementText.match(/\d+/)[0], 10);
                        elements.push({ type, match: elementText, index });
                        index += match[0].length; // Move index past the matched element
                        matched = true;
                        break;
                    }

                    // Handling explanation text
                    if (type === 'expl') {
                        const listType = 'expl';
                        const explItems = [];
                        let itemIndex = 0;

                        while (itemIndex < elementText.length) {
                            const linkMatch = /<a href="[^"]+">[^<]+<\/a>/.exec(elementText.slice(itemIndex));
                            if (linkMatch && linkMatch.index === 0) {
                                explItems.push({ type: 'link', match: linkMatch[0], index: itemIndex });
                                itemIndex += linkMatch[0].length;
                            } else {
                                const nextLinkIndex = elementText.indexOf('<a href=', itemIndex);
                                const endIndex = nextLinkIndex !== -1 ? nextLinkIndex : elementText.length;
                                const plainTextMatch = elementText.slice(itemIndex, endIndex);
                                if (plainTextMatch.trim()) {
                                    explItems.push({ type: 'plainText', match: plainTextMatch, index: itemIndex });
                                }
                                itemIndex = endIndex;
                            }
                        }
                        // Add the list item with the numbering adjusted and nested structure
                        elements.push({ type: listType, match: '', subItems: explItems, index });
                        index += match[0].length; // Move index past the matched element
                        matched = true;
                        break;
                    }

                    // Special handling for ordered list items
                    if (type === 'ol') {
                        const listType = 'ol';
                        const listItems = [];
                        let itemIndex = 0;

                        while (itemIndex < elementText.length) {
                            const linkMatch = /<a href="[^"]+">[^<]+<\/a>/.exec(elementText.slice(itemIndex));
                            if (linkMatch && linkMatch.index === 0) {
                                listItems.push({ type: 'link', match: linkMatch[0], index: itemIndex });
                                itemIndex += linkMatch[0].length;
                            } else {
                                const nextLinkIndex = elementText.indexOf('<a href=', itemIndex);
                                const endIndex = nextLinkIndex !== -1 ? nextLinkIndex : elementText.length;
                                const plainTextMatch = elementText.slice(itemIndex, endIndex);
                                if (plainTextMatch.trim()) {
                                    listItems.push({ type: 'plainText', match: plainTextMatch, index: itemIndex });
                                }
                                itemIndex = endIndex;
                            }
                        }

                        // Add the list item with the numbering adjusted and nested structure
                        elements.push({ type: listType, match: `${olIndex}. `, subItems: listItems, index });
                        olIndex++; // Increment the ordered list index
                        index += match[0].length; // Move index past the matched element
                        matched = true;
                        break;
                    }

                    // Special handling for unordered list items
                    if (type === 'ul') {
                        const listType = 'ul';
                        const listItems = [];
                        let itemIndex = 0;

                        while (itemIndex < elementText.length) {
                            const linkMatch = /<a href="[^"]+">[^<]+<\/a>/.exec(elementText.slice(itemIndex));
                            if (linkMatch && linkMatch.index === 0) {
                                listItems.push({ type: 'link', match: linkMatch[0], index: itemIndex });
                                itemIndex += linkMatch[0].length;
                            } else {
                                const nextLinkIndex = elementText.indexOf('<a href=', itemIndex);
                                const endIndex = nextLinkIndex !== -1 ? nextLinkIndex : elementText.length;
                                const plainTextMatch = elementText.slice(itemIndex, endIndex);
                                if (plainTextMatch.trim()) {
                                    listItems.push({ type: 'plainText', match: plainTextMatch, index: itemIndex });
                                }
                                itemIndex = endIndex;
                            }
                        }

                        // Add the list item with nested structure
                        elements.push({ type: listType, match: '', subItems: listItems, index });
                        index += match[0].length; // Move index past the matched element
                        matched = true;
                        break;
                    }

                    // Add the matched element to the array if no inner link was found
                    elements.push({ type, match: elementText, index });
                    index += match[0].length; // Move index past the matched element
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                let nextIndex = text.length;

                // Find the next match of any pattern in the remaining text
                for (const { regex } of patterns) {
                    const nextMatch = regex.exec(text.slice(index));
                    if (nextMatch && nextMatch.index !== 0 && index + nextMatch.index < nextIndex) {
                        nextIndex = index + nextMatch.index;
                    }
                }

                const plainTextMatch = text.slice(index, nextIndex); // Get plain text until the next match
                if (plainTextMatch.trim()) {
                    elements.push({ type: 'plainText', match: plainTextMatch, index });
                }
                index = nextIndex; // Move index to the next potential match position
            }
        }

        return elements; // Return the array of parsed elements
    }


  async function addMessage(sender, text, isPersonal, typing) {
        console.log("sender", sender);
        console.log("text", text);
        console.log("isPersonal", isPersonal);

        const messageDiv = document.createElement("div");
        messageDiv.className = "message" + (isPersonal ? " message-personal" : "");

        const avatarHtml = `
<figure class="avatar">
    <img src=${isPersonal ? "/chat_img.png" : "/vite.svg"}" alt="${sender}">
</figure>`;

        // const timestampHtml = `<div>${getCurrentTime()}</div>`;
        const messageTextDiv = document.createElement("div");
        messageTextDiv.className = "text";

        const parsedResponse = parseText(text);
        console.log("parsedResponse", parsedResponse);

        let partIndex = 0;
        // let charIndex = 0;

        const typeResponse =async() => {
            if (partIndex < parsedResponse.length) {
                const messageText = messageDiv.querySelector(".text");
                const part = parsedResponse[partIndex];

                if (part.type === 'link') {
                    appendLink(messageText, part.match, part.index);
                    partIndex++;
                    charIndex = 0;
                    typeResponse();
                } else {
                    let element;
                    if (part.type === 'reset') {
                        partIndex++;
                        charIndex = 0;
                        typeResponse();
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else if (part.type === 'plainText') {
                        element = document.createElement('span');
                        messageText.appendChild(element);
                        typeElement(element, part.match, 0, () => {
                            checkNextLink(element);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else if (part.type === 'header') {
                        element = document.createElement('h3');
                        messageText.appendChild(element);
                        const headerText = part.match.replace(/###([^#]+)###/, '$1');
                        typeElement(element, headerText, 0, () => {
                            checkNextLink(element);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else if (part.type === 'subheader') {
                        element = document.createElement('h4');
                        messageText.appendChild(element);
                        const subHeaderText = part.match.replace(/\*\*\*([^*]+)\*\*\*/, '$1');
                        typeElement(element, subHeaderText, 0, () => {
                            checkNextLink(element);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else if (part.type === 'ol') {
                        element = document.createElement('ol');
                        const li = document.createElement('li');
                        element.appendChild(li);
                        li.innerText = part.match;
                        li.classList.add('un_li')
                        messageText.appendChild(element);
                        //console.log(part.subItems)
                        //const olText = part.match.replace(/-#([^#]*)-#/, '$1');
                        typeOlItems(li, part.subItems, () => {
                            checkNextLink(li);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else if (part.type === 'ul') {
                        element = document.createElement('ul');
                        const li = document.createElement('li');
                        element.appendChild(li);
                        li.innerText = part.match;
                        //li.classList.add('un_li')
                        messageText.appendChild(element);
                        //const ulText = part.match.replace(/-\*([^*]*)-\*/, '$1');
                        typeUlItems(li, part.subItems, () => {
                            checkNextLink(li);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else if (part.type === 'expl') {
                        element = document.createElement('p');
                        element.className = "plain-text";
                        messageText.appendChild(element);
                        typeExplItems(element, part.subItems, () => {
                            checkNextLink(element);
                        });
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                }
            } else {
                stopLoader();
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
        };

        const typeOlItems = (listElement, listItems, callback) => {
            //console.log("typeListItems called with:", listElement, listItems, callback);

            let itemIndex = 0;

            const typeNextItem = () => {
                if (listItems && itemIndex < listItems.length) {
                    let listItem = listItems[itemIndex];
                    let linkText = listItem.match;
                    if (listItem.type === 'link') {
                        appendLink(listElement, linkText);
                        itemIndex++;
                        typeNextItem();
                    } else {
                        if (itemIndex < listItems.length) {
                            let olText = listItem.match.replace(/-#([^#]*)-#|-#/, '$1');
                            typeElement(listElement, olText, 0, () => {
                                //checkNextLink(listElement);
                                itemIndex++;
                                typeNextItem();
                            });

                        }
                    }

                } else {
                    callback();
                }
            };
            typeNextItem();
        };
        const typeUlItems = (listElement, listItems, callback) => {
            //console.log("typeListItems called with:", listElement, listItems, callback);

            let itemIndex = 0;

            const typeNextItem = () => {
                if (listItems && itemIndex < listItems.length) {
                    let listItem = listItems[itemIndex];
                    //let li = document.createElement('li');
                    //listElement.appendChild(li);
                    let linkText = listItem.match;
                    if (listItem.type === 'link') {
                        appendLink(listElement, linkText);
                        itemIndex++;
                        typeNextItem();
                    } else {
                        if (itemIndex < listItems.length) {
                            let liText = listItem.match.replace(/-\*([^*]*)-\*|-\*/, '$1');
                            typeElement(listElement, liText, 0, () => {
                                //checkNextLink(listElement);
                                itemIndex++;
                                typeNextItem();
                            });

                        }
                    }
                } else {
                    callback();
                }
            };
            typeNextItem();
        };

        const typeExplItems = (explElement, explItems, callback) => {

            let itemIndex = 0;

            const typeNextItem = () => {
                if (explItems && itemIndex < explItems.length) {
                    let explItem = explItems[itemIndex];
                    let linkText = explItem.match;
                    if (explItem.type === 'link') {
                        appendLink(explElement, linkText);
                        itemIndex++;
                        typeNextItem();
                    } else {
                        if (itemIndex < explItems.length) {
                            let explText = explItem.match.replace(/-\|([^*]*)-\||-\|/, '$1');
                            typeElement(explElement, explText, 0, () => {
                                itemIndex++;
                                typeNextItem();
                            });

                        }
                    }
                } else {
                    callback();
                }
            };
            typeNextItem();
        };


        const typeElement = (element, content, index = 0, callback = () => {}) => {
            // If typing is false, insert the entire content directly and call the callback
            if (!typing) {
                element.insertAdjacentText("beforeend", content);
                console.log(element,'my elemenhjchbrhbrhr')
                callback();  // Execute the callback immediately since there's no typing effect
            } else {
                // Otherwise, insert one character at a time with a delay
                if (index < content.length) {
                    element.insertAdjacentText("beforeend", content[index]);
                    
                    // Recursive call with delay for the next character
                    setTimeout(() => {
                        typeElement(element, content, index + 1, callback);
                    }, 20);  // Adjust delay as needed
                } else {
                    callback();  // Call the callback once the typing effect is finished
                }
            }
        };

        const appendLink = (element, link, position) => {
            element.innerHTML += link;
        };

        const checkNextLink = (currentElement) => {
            partIndex++;
            if (partIndex < parsedResponse.length && parsedResponse[partIndex].type === 'link') {
                appendLink(currentElement, parsedResponse[partIndex].match);
                partIndex++;
            }
            typeResponse();
        };

        const messageTextHtml = `
<div class="message-text">
    <div class="text"></div>
    <div class="timestamp"><p>${sender}</p><p>${getCurrentTime(isPersonal)}</p></div>
</div>`;

        messageDiv.innerHTML = isPersonal ? messageTextHtml + avatarHtml : avatarHtml + messageTextHtml;
        console.log(document.querySelector(".messages"))
        document.querySelector(".messages").appendChild(messageDiv);
        document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;

        if (!isPersonal) {
            const messageText = messageDiv.querySelector(".text");
            messageText.innerHTML = "";
           await typeResponse();
           setTyping(false)
        } else {
            const messageText = messageDiv.querySelector(".text");
            messageText.innerHTML = text;
        }
    }

    // Handle Enter key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (message != ""){
                if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
                    e.preventDefault();
                    sendMessage();
                }
            }
        };

        // Attach the event listener
        document.addEventListener("keydown", handleKeyDown);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [message]); // Dependency array includes message

 const sendMessage = async () => {
        if (message.trim() === "") return; // Prevent sending empty messages
        // const messageDiv = document.createElement("div");
        // messageDiv.className = "message message-personal";
        // const messageP = document.createElement("p");
        // messageP.textContent = message;
        // messageDiv.appendChild(messageP);
        // document.querySelector(".messages").appendChild(messageDiv);
                
        setTyping(true)

                 
       
    
        
        
     await addMessage("You", message, true, false);

                    // Simulating receiving a response after 1.5 seconds (replace with actual AJAX request)
    try{
        const response=await api.post('aiMessages/',{request:message})
        dispatch(
            addRequestResponse({request:message,response:response.data['response'],
        }))   
    }catch(error){
        setTyping(false)
        console.error(error)
    }                 
                    
                    
                     // Add bot's response to UI

        console.log('Message:', message);
        setMessage("");
    }
  
   useEffect(() => {
    const fetchUpdateMessages = async () => {
        if (isMounted) {
            try {
                console.log(texts.slice(-1)[0].response[0]);
                await addMessage(
                    "VA",
                    texts.slice(-1)[0].response[0],
                    false,
                    true
                );

            } catch (error) {
                console.error("Error in addMessage:", error);
            }
        } else {
            setMounted(true);
        }
    };

    fetchUpdateMessages();
}, [texts]);

    
    return (
        <div className="message-box text-black">
        <button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
        </button>
        <textarea className="message-input" type="text" value={message} onChange={handleChange}
            placeholder="Type a message..." ></textarea>
        <button onClick={()=>{typing===false&&sendMessage()}} className="">
        {typing===false?<i class="fa-solid fa-arrow-up"></i>:<div className="fa-3x loading-spinner"><i class="fas fa-spinner fa-spin font-[0]"></i>

            </div>}
        </button>
    </div>
    )
}

