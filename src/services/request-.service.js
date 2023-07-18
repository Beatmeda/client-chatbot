import axios from "axios"

const apiUrl = process.env.REACT_APP_API_URL;

const getIndicators = async () => {
    return await axios.get(`${apiUrl}/indicators`)
}

const getDeposit = async (data) => {
    return await axios.post(`${apiUrl}/consult_deposit`, {data: data})
}

const getPaperRolls = async (data) => {
    return await axios.post(`${apiUrl}/request_paper_rolls`, {data: data})
}

export {
    getIndicators,
    getDeposit,
    getPaperRolls
}