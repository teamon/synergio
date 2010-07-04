#! /usr/bin/env python
import os, subprocess as sub, time
base_dir = os.path.abspath(os.curdir)
src_dir = os.path.join(base_dir, 'src')
src = 'engine.js'

dist_dir = os.path.join(base_dir, 'dist')

cmd = '/usr/bin/sprocketize -C %(base_dir)s -a %(dist_dir)s -I %(src_dir)s %(src)s > %(dist)s'%(
	{'base_dir':base_dir, 'dist_dir':dist_dir, 'src_dir':src_dir, 
	'src':os.path.join(src_dir, src), 'dist':os.path.join(dist_dir, src)})

last_change = {}

while True:
	time.sleep(.5)
	p = sub.Popen('find %s -name *.js'%src_dir, stdin = sub.PIPE, stdout = sub.PIPE, shell = True)
	p.wait()
	changed = []
	for l in [l for l in p.stdout.read().split('\n') if l != '']:
		t = os.path.getmtime(l)
		if not last_change.has_key(l) or last_change[l] != t:
			changed.append(l.replace(base_dir, '').strip('/'))
			last_change[l] = t
	if len(changed) > 0:
		print ', '.join(changed) + ' changed. Sprocketizing...'
			
		p = sub.Popen(cmd, stdin = sub.PIPE, stdout = sub.PIPE, shell = True)
		p.wait()
		print p.stdout.read(),