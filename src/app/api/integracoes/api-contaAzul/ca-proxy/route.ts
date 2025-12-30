import { NextResponse } from 'next/server'

// Importe a função que criamos acima (ajuste o caminho conforme onde você salvou)
import { getValidToken } from '@/views/empresas/settings/integracaoes/contaAzul/contaAzulAuthHelper'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, empresaId } = body

    if (!endpoint || !empresaId) {
      return NextResponse.json({ error: 'Endpoint e EmpresaID são obrigatórios' }, { status: 400 })
    }

    // 1. Pega um token VÁLIDO (se estiver velho, ele renova sozinho)
    const accessToken = await getValidToken(Number(empresaId))

    // 2. Monta a URL
    const baseUrl = 'https://api-v2.contaazul.com'
    const finalUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

    console.log('--- DEBUG PROXY ---')
    console.log('Chamando URL:', finalUrl) // <--- OLHE ISSO NO SEU TERMINAL

    const caResponse = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    // 3. Processa resposta
    let data
    const contentType = caResponse.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      data = await caResponse.json()
    } else {
      data = await caResponse.text()
    }

    // Se der 404 ou erro, vamos ver o que a Conta Azul respondeu
    if (!caResponse.ok) {
      console.error('Erro API CA:', caResponse.status, data)
    }

    return NextResponse.json(
      {
        status: caResponse.status,
        data: data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro Proxy CA:', error)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
