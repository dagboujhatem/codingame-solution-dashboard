const checkReauth = async (req, res, next) => {
    const db = req.app.get('db');
    const user = req.user;

    try {
        if (!user) {
            return next();
        } else {
            const uid = user.uid;
            if(!uid){
                return next();
            }
            const userDoc = await db.collection('users').doc(uid).get();
            const userData = userDoc.data();

            if (userData?.mustLoginAgain) {
                return res.status(403).json({
                    message: "Vous devez vous reconnecter pour effectuer cette action.",
                    mustLoginAgain: true
                });
            }

            return next();
        }

    } catch (error) {
        console.error("Erreur dans checkReauth:", error);
        return res.status(500).json({ error: "Erreur interne de vérification de session." });
    }
};

export default checkReauth;
