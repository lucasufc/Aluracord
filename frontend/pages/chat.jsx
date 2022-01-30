import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React, { useEffect, useState } from "react";
import appConfig from "../config.json";
import { createClient } from '@supabase/supabase-js'
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzUzNDQwOSwiZXhwIjoxOTU5MTEwNDA5fQ.W7-U4GAo8oSrENYPuhx3qcVErajEjZ6TRMWRR8_kt_4'
const SUPABASE_URL = 'https://avodjlrdappqpmvppawt.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function updateChat(handleNewMessage){
    return supabaseClient.from('messages')
    .on("INSERT", (newMessage)=>{
        handleNewMessage(newMessage.new);
    })
    .subscribe()
}

export default function ChatPage() {
    // Sua lógica vai aqui
    const [mensagem, setMensagem] = useState("");
    const [chat, setChat] = useState([]);
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username || 'github';
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 3000)
        
        supabaseClient
        .from('mensagens')
        .select('*')
        .then(({ data }) => {
            setChat(data)
        })

        const update = updateChat((newMessage)=>{
            setChat((messageList)=>{
                return [
                    newMessage,
                    ...messageList,
                ]
            })
        })
        
    },[])
    
  function handleChat(valor) {
    const mensagem = {
      de: usuarioLogado,
      texto: valor,
    };
    supabaseClient.from('mensagens')
    .insert([mensagem])
    .then(setMensagem(""))
  }
  // ./Sua lógica vai aqui
  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://wallpaperaccess.com/full/1673279.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList mensagem={chat} />

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleChat(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                verticalAlign: "middle",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />

            <ButtonSendSticker onStickerClick={(sticker) => {
                handleChat(':sticker:' + sticker)
            }}/>


            <Button
              type="button"
              label="Enviar"
              onClick={() => {
                  handleChat(mensagem)
              }}
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals["000"],
                mainColor: appConfig.theme.colors.primary[500],
                mainColorLight: appConfig.theme.colors.primary[400],
                mainColorStrong: appConfig.theme.colors.primary[600],
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {

  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        wordBreak:"break-word",
        justifyContent: "flex-end",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.mensagem.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
                display: 'flex',
                alignItems: 'baseline'
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${mensagem.de}.png`}
              />
              <Text tag="strong">{mensagem.de}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            {mensagem.texto.startsWith(':sticker:')? (
               <Image src={mensagem.texto.replace(':sticker:','')} />
            ): (
                mensagem.texto
            )}
          </Text>
        );
      })}
    </Box>
  );
}
