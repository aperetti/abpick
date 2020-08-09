interface PostBoardResult {
    result?: Array<number>
    error?: string
}

async function postBoard(form: FormData): Promise<PostBoardResult> {
    let res = await fetch("/api/postBoard", {method: 'post', body: form})
    let json = await res.json()
    return json
}

export default postBoard