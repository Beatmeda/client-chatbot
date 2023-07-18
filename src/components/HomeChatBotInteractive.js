import React, {useEffect, useState} from "react"
import '../utils/style.css'
import {getIndicators, getDeposit, getPaperRolls} from "../services/request-.service";
import Swal from "sweetalert2";

function HomeChatBotInteractive() {
    const [typeTransaction, setTypeTransaction] = useState('')
    const [placeholderInput, setPlaceholderInput] = useState('')
    const [quantityResponseUser, setQuantityResponseUser] = useState(0)
    const [dataConsultDeposit, setDataConsultDeposit] = useState({
        rut: '',
        date: null
    })
    const [dataPaperRolls, setDataPaperRolls] = useState({
        rut: '',
        dispatch_address: '',
        quantity_rolls: 0
    })


    const formattedBalance = (amount) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return formatter.format(amount);
    }

    const addUserMessage = (message) => {
        const chatLog = document.getElementById('chatLog');
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user');
        userMessage.innerHTML = `<p>${message}</p>`;
        chatLog.appendChild(userMessage);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    const addBotMessage = (message) => {
        const chatLog = document.getElementById('chatLog');
        const botMessage = document.createElement('div');
        botMessage.classList.add('chat-message', 'bot');
        botMessage.innerHTML = `<p>${message}</p>`;
        chatLog.appendChild(botMessage);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    const handleUserInput = () => {
        const userInput = document.getElementById('userInput')
        const message = userInput.value.trim()

        if (message !== '') {
            addUserMessage(message)
            userInput.value = ''

            setQuantityResponseUser(quantityResponseUser + 1)
            const reply = findReply(message)
            if (reply !== '') {
                setTimeout(() => {
                    addBotMessage(reply)
                }, 500)
            }
            userInput.focus()
        }
    }

    const findReply = (message) => {
        let label = ''
        if (quantityResponseUser === 0 && typeTransaction === 'consult_deposit') {
            label = 'Ingrese la fecha del depósito'
            setDataConsultDeposit((prevState) => ({
                ...prevState,
                rut: message
            }))
            setPlaceholderInput(label)
            return label
        } else if (quantityResponseUser === 1 && typeTransaction === 'consult_deposit') {
            setDataConsultDeposit((prevState) => ({
                ...prevState,
                date: message
            }))
            setPlaceholderInput('Buscando información...')
            return label
        } else if (quantityResponseUser === 0 && typeTransaction === 'request_paper_rolls') {
            label = 'Ingrese la dirección de despacho'
            setDataPaperRolls((prevState) => ({
                ...prevState,
                rut: message
            }))
            setPlaceholderInput(label)
            return label
        } else if (quantityResponseUser === 1 && typeTransaction === 'request_paper_rolls') {
            label = 'Ingrese la cantidad de rollos a solicitar'
            setDataPaperRolls((prevState) => ({
                ...prevState,
                dispatch_address: message
            }))
            setPlaceholderInput(label)
            return label
        } else if ((quantityResponseUser === 2 || quantityResponseUser === 3) && typeTransaction === 'request_paper_rolls') {
            setDataPaperRolls((prevState) => ({
                ...prevState,
                quantity_rolls: message
            }))
            setPlaceholderInput('Buscando información...')
            return label
        } else {
            return 'Bye!'
        }

    }

    const consultDeposit = () => {
        getDeposit(dataConsultDeposit).then((response) => {
            if (response.status === 200) {
                addBotMessage("El  saldo  que  será  depositado  en  la  fecha ingresada es: " + formattedBalance(response.data.balance))
                setTypeTransaction('')
                setPlaceholderInput('')
            } else {
                addBotMessage(response.data.error)
            }
        }).catch((error) => {
            Swal.fire("Error", "Error en consulta de depósito", "error")
        })
    }

    const paperRolls = () => {
        getPaperRolls(dataPaperRolls).then((response) => {
            if (response.status === 200) {
                addBotMessage("El valor por la cantidad de rollos es : " + formattedBalance(response.data.value_quantity_rolls))
                addBotMessage("El  depósito de mañana fue actualizado, el nuevo balance es : " + formattedBalance(response.data.balance))
                addBotMessage("El balance anterior era : " + formattedBalance(response.data.old_balance))
                setTypeTransaction('')
                setPlaceholderInput('')
            } else {
                addBotMessage(response.data.error)
            }
        }).catch(() => {
            Swal.fire("Error", "Error en consulta de rollos de papel", "error")
        })
    }

    const indicators = () => {
        getIndicators().then((response) => {
            console.log(response)
            addBotMessage('El valor actual de la UF es $' + response.data.result.value_uf)
            addBotMessage('El valor actual del dólar observado es $' + response.data.result.value_usd)
            addBotMessage('El valor actual del Dólar acuerdo es $' + response.data.result.value_exchange_usd)
            addBotMessage('El valor actual del Euro es $' + response.data.result.value_eur)
            addBotMessage('El valor actual del IPC es ' + response.data.result.value_ipc)
            addBotMessage('El valor actual de la UTM es $' + response.data.result.value_utm)
        }).catch(() => {
            Swal.fire("Error", "Error en consulta de indicadores", "error")
        })
    }


    useEffect(() => {
        const label = 'Ingresa el número del RUT'
        switch (typeTransaction) {
            case 'consult_deposit':
                setPlaceholderInput(label)
                break
            case 'request_paper_rolls':
                setPlaceholderInput(label)
                break
            case 'indicators':
                setPlaceholderInput('Consultando información...')
                indicators()
                break
            default:
                break
        }
    }, [typeTransaction])

    useEffect(() => {
        if (dataPaperRolls.quantity_rolls !== 0) {
            paperRolls()
        }
    }, [dataPaperRolls.quantity_rolls])

    useEffect(() => {
        if (dataConsultDeposit.date !== null) {
            consultDeposit()
        }
    }, [dataConsultDeposit.date])

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleUserInput()
        }
    };

    return (
        <div>
            <button onClick={() => window.location.href = ''}>Reiniciar Bot</button>
            <div className="chat-container">
                <div className="chat-header">
                    <h2><i className="fa fa-robot animated"></i> Chatbot</h2>
                </div>
                <div className="chat-log" id="chatLog">
                    <div className="chat-message bot">
                        <p>¿Qué desea consultar?</p>
                        <div className={'row button-chat-bot'}>
                            <button disabled={typeTransaction !== ''}
                                    onClick={() => setTypeTransaction('consult_deposit')}>Consulta de depósito
                            </button>
                        </div>
                        <div className={'row button-chat-bot'}>
                            <button disabled={typeTransaction !== ''}
                                    onClick={() => setTypeTransaction('request_paper_rolls')}>
                                Realizar solicitud rollos de papel
                            </button>
                        </div>
                        <div className={'row button-chat-bot'}>
                            <button disabled={typeTransaction !== ''} onClick={() => setTypeTransaction('indicators')}>
                                Consulta indicadores económicos
                            </button>
                        </div>
                    </div>
                </div>
                <div className="chat-input">
                    <input
                        type={(quantityResponseUser === 1 && typeTransaction === 'consult_deposit') ? 'date' : 'text'}
                        id="userInput" placeholder={placeholderInput}
                        onKeyDown={handleKeyDown}
                        disabled={typeTransaction === '' || typeTransaction === 'indicators'}/>
                    <button id="sendBtn" onClick={() => handleUserInput()}><i className="fa fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomeChatBotInteractive