import { Box, Button, TextField, Typography, InputAdornment, IconButton } from "@mui/material"
import { useState } from "react"
import { supabase } from "../supabaseClient"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

function ChangePassword() {

    const [currentPassword, setCurrentPassword] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    // 👁 visibility states
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function changePassword() {

        setMessage('')

        if (!currentPassword || !password || !confirmPassword) {
            setMessage('All fields are required')
            return
        }

        if (password !== confirmPassword) {
            setMessage('New passwords do not match')
            return
        }

        setLoading(true)

        const { data: userData, error: signInError } =
            await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user?.email!,
                password: currentPassword
            })

        if (signInError || !userData.user) {
            setLoading(false)
            setMessage('Current password is incorrect')
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: password.trim()
        })

        setLoading(false)

        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Password updated successfully')
            setCurrentPassword('')
            setPassword('')
            setConfirmPassword('')
        }
    }

    async function uploadProfilePicture() {

        if (!avatarFile) {
            setMessage("Please select an image first")
            return
        }

        setLoading(true)

        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            setLoading(false)
            setMessage(uploadError.message)
            return
        }

        const { data } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath)

        const publicUrl = data.publicUrl

        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        })

        setLoading(false)

        if (updateError) {
            setMessage(updateError.message)
        } else {
            setMessage("Profile picture updated successfully")
        }
    }

    const toggle = (setter: any, value: boolean) => setter(!value)


    return (

        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Change Password
            </Typography>

            {/* CURRENT PASSWORD */}
            <TextField
                fullWidth
                type={showCurrent ? "text" : "password"}
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => toggle(setShowCurrent, showCurrent)}>
                                {showCurrent ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            {/* NEW PASSWORD */}
            <TextField
                fullWidth
                type={showNew ? "text" : "password"}
                label="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => toggle(setShowNew, showNew)}>
                                {showNew ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            {/* CONFIRM PASSWORD */}
            <TextField
                fullWidth
                type={showConfirm ? "text" : "password"}
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => toggle(setShowConfirm, showConfirm)}>
                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            <Button
                variant="contained"
                onClick={changePassword}
                disabled={loading}
            >
                {loading ? "Updating..." : "Update Password"}
            </Button>

            <Typography sx={{ mt: 2 }}>
                {message}
            </Typography>
            <Box sx={{ mt: 4 }}>
                
            </Box>
        </Box>
    )
}

export default ChangePassword