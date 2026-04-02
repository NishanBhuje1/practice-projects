const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, reason } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const userId = authData.user.id

    const { error: dataError } = await supabaseAdmin.rpc('delete_user_data', {
      p_user_id: userId,
    })

    if (dataError) throw dataError

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    console.log(`Account deleted: ${email}, reason: ${reason || 'not provided'}`)

    res.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ error: 'Failed to delete account. Please try again.' })
  }
}
