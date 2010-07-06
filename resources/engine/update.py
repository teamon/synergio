#! /usr/bin/env python
import os, subprocess as sub, time, pyfsevents, sys, getopt

last_change = {}
exclude = lambda path: not path.lower().endswith('.js')

def usage():
	pass

def fscallback(path, recusive):
	changed = []
	for root, dirs, paths in os.walk(path):
		map(paths.remove, [p for p in paths if exclude(p)])
		for f in paths:
			f = os.path.join(root, f)			
			t = os.path.getmtime(f)
			if not last_change.has_key(f) or last_change[f] != t:
				changed.append(f.replace(base_dir, '').strip('/'))
				last_change[f] = t
	if len(changed) > 0:
		print ', '.join(changed) + ' changed. Sprocketizing...',
		p = sub.Popen(cmd, stdin = sub.PIPE, stdout = sub.PIPE, shell = True)
		p.wait()
	
		print ''

def find(l, values, default):
	if not type(values) in [list, tuple]:
		values = (values,)
	try:
		return [x for a, x in l if a in values][0]
	except IndexError:
		return default

try:
	optlist, args = getopt.gnu_getopt(sys.argv[1:], 'i:a:c:h', ['help', 'output', 'input', 'base'])
except getopt.GetoptError, err:
	print str(err)
	usage()
	exit(1)

if find(optlist, ['-h', '--help'], None) != None: 
	usage()
	exit(0)

src = args[0] if len(args) >= 1 else 'engine.js'

base_dir = find(optlist, ['-c', '--base'], os.path.abspath(os.curdir))
src_dir = find(optlist, ['-i', '--input'], os.path.join(base_dir, 'src'))
dist_dir = find(optlist, ['-a', '--output'], os.path.join(base_dir, 'dist'))

cmd = '/usr/bin/sprocketize -C %(base_dir)s -a %(dist_dir)s -I %(src_dir)s %(src)s > %(dist)s'%(
	{'base_dir':base_dir, 'dist_dir':dist_dir, 'src_dir':src_dir, 
	'src':os.path.join(src_dir, src), 'dist':os.path.join(dist_dir, src)})

fscallback(src_dir, False)
pyfsevents.registerpath(src_dir, fscallback)
try:
	pyfsevents.listen()
except KeyboardInterrupt:
	exit(0)