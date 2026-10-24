import React, { useEffect, useState } from 'react';
import { request } from './api';

export default function App() {
    // ========================================
    // State Management
    // ========================================

    const [session, S] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ss'));
        } catch {
            return null;
        }
    });

    const [mode, M] = useState('login');

    const [auth, A] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee',
    });

    const [section, T] = useState('overview');

    const [data, D] = useState({
        employees: [],
        leaves: [],
        attendance: [],
        announcements: [],
        trainings: [],
    });

    const [msg, G] = useState('');
    const [err, E] = useState('');
    const [busy, B] = useState(false);

    const [form, F] = useState({
        name: '',
        email: '',
        department: '',
        position: '',
        startDate: '',
        endDate: '',
        reason: '',
        title: '',
        message: '',
        description: '',
        trainer: '',
        date: '',
    });

    const role = session?.user?.role;
    const user = session?.user;

    // ========================================
    // Session Management
    // ========================================

    const save = (value) => {
        localStorage.setItem('ss', JSON.stringify(value));
        S(value);
    };

    const logout = () => {
        localStorage.removeItem('ss');
        S(null);
    };

    // ========================================
    // Load Dashboard Data
    // ========================================

    async function load() {
        if (!session?.token) return;

        const keys = [
            'employees',
            'leaves',
            'attendance',
            'announcements',
            'trainings',
        ];

        const pairs = await Promise.all(
            keys.map(async (key) => {
                try {
                    return [
                        key,
                        await request('/' + key, {
                            token: session.token,
                        }),
                    ];
                } catch {
                    return [key, []];
                }
            })
        );

        D(Object.fromEntries(pairs));
    }

    useEffect(() => {
        load();
    }, [session?.token]);

    // ========================================
    // Login and Registration
    // ========================================

    async function authSubmit(e) {
        e.preventDefault();

        B(true);
        E('');

        try {
            const result = await request('/auth/' + mode, {
                method: 'POST',
                body: JSON.stringify(auth),
            });

            save(result);
            G('Signed in successfully.');
        } catch (error) {
            E(error.message);
        } finally {
            B(false);
        }
    }

    // ========================================
    // Add Records
    // ========================================

    async function add(e) {
        e.preventDefault();

        B(true);
        E('');

        const map = {
            employees: '/employees',
            leaves: '/leaves',
            announcements: '/announcements',
            trainings: '/trainings',
        };

        const body = { ...form };

        try {
            await request(map[section], {
                method: 'POST',
                token: session.token,
                body: JSON.stringify(body),
            });

            G('Saved successfully.');

            F({
                name: '',
                email: '',
                department: '',
                position: '',
                startDate: '',
                endDate: '',
                reason: '',
                title: '',
                message: '',
                description: '',
                trainer: '',
                date: '',
            });

            await load();
        } catch (error) {
            E(error.message);
        } finally {
            B(false);
        }
    }

    // ========================================
    // Approve or Reject Leave
    // ========================================

    async function decide(id, status) {
        try {
            await request('/leaves/' + id + '/status', {
                method: 'PATCH',
                token: session.token,
                body: JSON.stringify({ status }),
            });

            await load();
        } catch (error) {
            E(error.message);
        }
    }

    // ========================================
    // Login / Registration Screen
    // ========================================

    if (!session) {
        return (
            <div className="auth">
                <div className="card">
                    <div className="logo">S</div>

                    <p className="tag">PEOPLE · WORK · GROWTH</p>

                    <h1>
                        {mode === 'login'
                            ? 'Welcome to StaffSync'
                            : 'Create your account'}
                    </h1>

                    <p className="muted">
                        Human resources, in one simple workspace.
                    </p>

                    {err && <p className="error">{err}</p>}

                    <form onSubmit={authSubmit}>
                        {mode === 'register' && (
                            <label>
                                Name
                                <input
                                    required
                                    value={auth.name}
                                    onChange={(e) =>
                                        A({
                                            ...auth,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </label>
                        )}

                        <label>
                            Email
                            <input
                                type="email"
                                required
                                value={auth.email}
                                onChange={(e) =>
                                    A({
                                        ...auth,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </label>

                        <label>
                            Password
                            <input
                                type="password"
                                minLength="6"
                                required
                                value={auth.password}
                                onChange={(e) =>
                                    A({
                                        ...auth,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </label>

                        {mode === 'register' && (
                            <label>
                                Demo role
                                <select
                                    value={auth.role}
                                    onChange={(e) =>
                                        A({
                                            ...auth,
                                            role: e.target.value,
                                        })
                                    }
                                >
                                    <option value="employee">
                                        Employee
                                    </option>
                                    <option value="manager">
                                        Manager
                                    </option>
                                    <option value="hr">HR</option>
                                </select>
                            </label>
                        )}

                        <button disabled={busy}>
                            {busy
                                ? 'Please wait…'
                                : mode === 'login'
                                  ? 'Sign in'
                                  : 'Register'}
                        </button>
                    </form>

                    <p className="muted center">
                        {mode === 'login'
                            ? 'New here?'
                            : 'Already registered?'}{' '}
                        <a
                            onClick={() => {
                                M(
                                    mode === 'login'
                                        ? 'register'
                                        : 'login'
                                );
                                E('');
                            }}
                        >
                            {mode === 'login'
                                ? 'Create account'
                                : 'Sign in'}
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    // ========================================
    // Navigation and Page Titles
    // ========================================

    const nav = [
        ['overview', 'Overview'],
        ...(role !== 'employee' ? [['employees', 'Employees']] : []),
        ['leaves', 'Leave requests'],
        ['attendance', 'Attendance'],
        ['announcements', 'Announcements'],
        ['trainings', 'Training'],
    ];

    const titles = {
        overview: 'Dashboard',
        employees: 'Employee directory',
        leaves: 'Leave requests',
        attendance: 'Attendance',
        announcements: 'Announcements',
        trainings: 'Training & development',
    };

    // ========================================
    // Reusable Table Function
    // ========================================

    function table(items, cols) {
        if (!items.length) {
            return <p className="empty">No records yet.</p>;
        }

        return (
            <div className="overflow">
                <table>
                    <thead>
                        <tr>
                            {cols.map((col) => (
                                <th key={col[0]}>{col[0]}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item) => (
                            <tr key={item._id}>
                                {cols.map((col) => (
                                    <td key={col[0]}>
                                        {col[1](item)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // ========================================
    // Reusable Status and Form Fields
    // ========================================

    const status = (value) => (
        <span className={'status ' + value}>{value}</span>
    );

    const fields = {
        employees: [
            ['name', 'Employee name'],
            ['email', 'Email'],
            ['department', 'Department'],
            ['position', 'Position'],
        ],

        leaves: [
            ['startDate', 'Start date', 'date'],
            ['endDate', 'End date', 'date'],
            ['reason', 'Reason'],
        ],

        announcements: [
            ['title', 'Title'],
            ['message', 'Message'],
        ],

        trainings: [
            ['title', 'Training title'],
            ['description', 'Description'],
            ['trainer', 'Trainer'],
            ['date', 'Date', 'date'],
        ],
    };

    // ========================================
    // Main Dashboard
    // ========================================

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside>
                <div className="brand">
                    <span className="logo small">S</span>
                    StaffSync
                </div>

                <p className="tag">WORKSPACE</p>

                {nav.map((item) => (
                    <button
                        className={
                            section === item[0] ? 'selected' : ''
                        }
                        key={item[0]}
                        onClick={() => T(item[0])}
                    >
                        {item[1]}
                    </button>
                ))}

                <div className="user">
                    <b>{user.name}</b>
                    <span>{role}</span>
                    <button onClick={logout}>Sign out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                <header>
                    <div>
                        <p className="tag">STAFFSYNC WORKSPACE</p>
                        <h1>{titles[section]}</h1>
                    </div>

                    <button className="light" onClick={load}>
                        Refresh
                    </button>
                </header>

                {msg && <p className="success">{msg}</p>}
                {err && <p className="error">{err}</p>}

                {/* Dashboard Overview */}
                {section === 'overview' && (
                    <>
                        <div className="hero">
                            <p className="tag">YOUR PEOPLE, ONE PLACE</p>
                            <h2>
                                Hello, {user.name.split(' ')[0]} 👋
                            </h2>
                            <p>
                                Manage people operations from one
                                workspace.
                            </p>
                        </div>

                        <div className="stats">
                            {(role !== 'employee'
                                ? [
                                      [
                                          'Employees',
                                          data.employees.length,
                                      ],
                                  ]
                                : []
                            )
                                .concat([
                                    [
                                        'Leave requests',
                                        data.leaves.length,
                                    ],
                                    [
                                        'Attendance records',
                                        data.attendance.length,
                                    ],
                                    [
                                        'Announcements',
                                        data.announcements.length,
                                    ],
                                    [
                                        'Training programs',
                                        data.trainings.length,
                                    ],
                                ])
                                .map((item) => (
                                    <div
                                        className="stat"
                                        key={item[0]}
                                    >
                                        <span>{item[0]}</span>
                                        <b>{item[1]}</b>
                                    </div>
                                ))}
                        </div>

                        <section>
                            <h2>Recent leave requests</h2>

                            {table(data.leaves.slice(0, 5), [
                                [
                                    'Employee',
                                    (item) => item.employeeName,
                                ],
                                [
                                    'Start',
                                    (item) =>
                                        new Date(
                                            item.startDate
                                        ).toLocaleDateString(),
                                ],
                                [
                                    'End',
                                    (item) =>
                                        new Date(
                                            item.endDate
                                        ).toLocaleDateString(),
                                ],
                                [
                                    'Status',
                                    (item) => status(item.status),
                                ],
                            ])}
                        </section>
                    </>
                )}

                {/* Employee Directory */}
                {section === 'employees' && (
                    <section>
                        <h2>Employee directory</h2>

                        {role === 'hr' && (
                            <form className="add" onSubmit={add}>
                                {fields.employees.map((field) => (
                                    <label key={field[0]}>
                                        {field[1]}
                                        <input
                                            required={[
                                                'name',
                                                'email',
                                            ].includes(field[0])}
                                            value={form[field[0]]}
                                            onChange={(e) =>
                                                F({
                                                    ...form,
                                                    [field[0]]:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                ))}

                                <button>Add employee</button>
                            </form>
                        )}

                        {table(data.employees, [
                            ['Name', (item) => item.name],
                            ['Email', (item) => item.email],
                            [
                                'Department',
                                (item) => item.department,
                            ],
                            [
                                'Position',
                                (item) => item.position,
                            ],
                            [
                                'Status',
                                (item) => status(item.status),
                            ],
                        ])}
                    </section>
                )}

                {/* Leave Requests */}
                {section === 'leaves' && (
                    <section>
                        <h2>Leave requests</h2>

                        <form className="add" onSubmit={add}>
                            {fields.leaves.map((field) => (
                                <label key={field[0]}>
                                    {field[1]}

                                    {field[2] === 'date' ? (
                                        <input
                                            type="date"
                                            required
                                            value={form[field[0]]}
                                            onChange={(e) =>
                                                F({
                                                    ...form,
                                                    [field[0]]:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <input
                                            required
                                            value={form[field[0]]}
                                            onChange={(e) =>
                                                F({
                                                    ...form,
                                                    [field[0]]:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    )}
                                </label>
                            ))}

                            <button>Apply for leave</button>
                        </form>

                        {table(data.leaves, [
                            [
                                'Employee',
                                (item) => item.employeeName,
                            ],
                            [
                                'Start',
                                (item) =>
                                    new Date(
                                        item.startDate
                                    ).toLocaleDateString(),
                            ],
                            [
                                'End',
                                (item) =>
                                    new Date(
                                        item.endDate
                                    ).toLocaleDateString(),
                            ],
                            ['Reason', (item) => item.reason],
                            [
                                'Status',
                                (item) => status(item.status),
                            ],
                            [
                                'Review',
                                (item) =>
                                    ['hr', 'manager'].includes(role) &&
                                    item.status === 'pending' ? (
                                        <span>
                                            <button
                                                className="tiny"
                                                onClick={() =>
                                                    decide(
                                                        item._id,
                                                        'approved'
                                                    )
                                                }
                                            >
                                                Approve
                                            </button>{' '}
                                            <button
                                                className="tiny danger"
                                                onClick={() =>
                                                    decide(
                                                        item._id,
                                                        'rejected'
                                                    )
                                                }
                                            >
                                                Reject
                                            </button>
                                        </span>
                                    ) : (
                                        '—'
                                    ),
                            ],
                        ])}
                    </section>
                )}

                {/* Attendance */}
                {section === 'attendance' && (
                    <section>
                        <h2>Attendance records</h2>

                        {table(data.attendance, [
                            [
                                'Employee',
                                (item) => item.employeeName,
                            ],
                            [
                                'Date',
                                (item) =>
                                    new Date(
                                        item.date
                                    ).toLocaleDateString(),
                            ],
                            [
                                'Status',
                                (item) => status(item.status),
                            ],
                            [
                                'Note',
                                (item) => item.note || '—',
                            ],
                        ])}

                        <p className="muted">
                            HR can add attendance using POST
                            /api/attendance (see README API notes).
                        </p>
                    </section>
                )}

                {/* Announcements */}
                {section === 'announcements' && (
                    <section>
                        <h2>Announcements</h2>

                        {role === 'hr' && (
                            <form className="add" onSubmit={add}>
                                {fields.announcements.map((field) => (
                                    <label key={field[0]}>
                                        {field[1]}
                                        <input
                                            required
                                            value={form[field[0]]}
                                            onChange={(e) =>
                                                F({
                                                    ...form,
                                                    [field[0]]:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                ))}

                                <button>Publish</button>
                            </form>
                        )}

                        {data.announcements.map((item) => (
                            <article key={item._id}>
                                <h3>{item.title}</h3>
                                <p>{item.message}</p>
                                <small>
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleString()}
                                </small>
                            </article>
                        ))}

                        {!data.announcements.length && (
                            <p className="empty">
                                No announcements yet.
                            </p>
                        )}
                    </section>
                )}

                {/* Training and Development */}
                {section === 'trainings' && (
                    <section>
                        <h2>Training &amp; development</h2>

                        {['hr', 'manager'].includes(role) && (
                            <form className="add" onSubmit={add}>
                                {fields.trainings.map((field) => (
                                    <label key={field[0]}>
                                        {field[1]}
                                        <input
                                            type={field[2] || 'text'}
                                            value={form[field[0]]}
                                            onChange={(e) =>
                                                F({
                                                    ...form,
                                                    [field[0]]:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                ))}

                                <button>Add training</button>
                            </form>
                        )}

                        {data.trainings.map((item) => (
                            <article key={item._id}>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <small>
                                    {item.trainer} ·{' '}
                                    {item.date
                                        ? new Date(
                                              item.date
                                          ).toLocaleDateString()
                                        : 'Date TBA'}
                                </small>
                            </article>
                        ))}

                        {!data.trainings.length && (
                            <p className="empty">
                                No training programs yet.
                            </p>
                        )}
                    </section>
                )}

                {/* Footer */}
                <footer>
                    StaffSync · HR Management System
                </footer>
            </main>
        </div>
    );
}


