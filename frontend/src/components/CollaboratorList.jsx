import React, { useEffect, useState } from 'react';

const CollaboratorList = ({ engine }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!engine || !engine.awareness) return;

        const refreshUsers = () => {
            const allStates = Array.from(engine.awareness.getStates().values());

            const uniqueUsers = [];
            const seenIds = new Set();
            allStates.forEach(state => {
                if (state.user && !seenIds.has(state.user.id)) {
                    uniqueUsers.push(state.user);
                    seenIds.add(state.user.id);
                }
            });
            setUsers(uniqueUsers);
        };

        refreshUsers();
        engine.awareness.on('change', refreshUsers);

        return () => {
            engine.awareness.off('change', refreshUsers);
        };
    }, [engine]);

    if (users.length <= 1) return null; // Only me

    return (
        <div className="flex items-center justify-end px-4 h-full pointer-events-auto">
            <div className="flex -space-x-2">
                {users.map((user, i) => (
                    <div
                        key={user.id || i}
                        className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: user.color || '#F59E0B' }}
                        title={user.name}
                    >
                        {user.name ? user.name.slice(0, 1) : '?'}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollaboratorList;
