module main

import veb
import os
import net.http

pub struct App {
mut:
	state ?string
}

pub struct Context {
	veb.Context
}

fn save_cache(data string, name string) {
	// check if cache folder exists
	if !os.exists('cache') {
		os.mkdir('cache') or { panic('os permission error') }
	}
	os.write_file('cache/' + name, data) or { panic('os permission error') }
}

fn get_cache(name string) ?string {
	if !os.exists('cache') {
		eprintln('warning: cache not created')
		return none
	}
	if !os.exists('cache/' + name) {
		return none
	}
	return os.read_file('cache/' + name) or { panic('os permission error') }
}

const replace_chars = ['/', ':', '<', '>', '?', '"', '|', '*', '=', '_']

fn url_to_file_name(url string) string {
	mut out := url
	for to_replace in replace_chars {
		out = out.replace(to_replace, '_')
	}
	return out
}

fn fetch_from_api(url string) (string, bool) {
	if url.contains('/img/') {
		result := http.get('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/' +
			url.replace_once('/img/', '/')) or { return 'img fetching error', false }
		if result.status_code != 200 {
			return result.body, false
		}
		save_cache(result.body, url_to_file_name(url))
		return result.body, true
	}
	result := http.get('https://pokeapi.co/api/v2/' + url) or { return 'api fetching error', false }
	body := result.body.replace('https://pokeapi.co/api/v2/', '').replace('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/',
		'img/')
	save_cache(body, url_to_file_name(url))
	return body, true
}

fn grab(url string, use_cache bool) (string, bool) {
	if use_cache {
		cache_data := get_cache(url_to_file_name(url))
		if cache_data != none {
			return cache_data, true
		}
	}
	data, success := fetch_from_api(url)
	return data, success
}

pub fn (app &App) index(mut ctx Context) veb.Result {
	return ctx.text('Pokemon project server')
}

@['/favicon.ico']
pub fn (app &App) favicon(mut ctx Context) veb.Result {
	return ctx.not_found()
}

@['/state'; get]
pub fn (app &App) get_state(mut ctx Context) veb.Result {
	if app.state == none {
		ctx.res.set_status(.not_found)
		return ctx.text('No state set')
	}
	return ctx.text(app.state or { '' })
}

@['/state'; put]
pub fn (mut app App) post_state(mut ctx Context) veb.Result {
	app.state = ctx.req.data
	return ctx.text('State updated')
}

@['/no_cache/:path...']
pub fn (app &App) no_cache_proxy(mut ctx Context, path string) veb.Result {
	if path == '' {
		return ctx.not_found()
	}
	data, success := grab(ctx.req.url.replace('/no_cache', ''), false)
	if success {
		if ctx.req.url.contains('/img/') {
			ctx.set_content_type('image/png')
		} else {
			ctx.set_content_type('application/json')
		}
	}
	return ctx.text(data)
}

@['/:path...']
pub fn (app &App) cached_proxy(mut ctx Context, path string) veb.Result {
	if path == '' {
		return ctx.not_found()
	}
	data, success := grab(ctx.req.url, true)
	if success {
		if ctx.req.url.contains('/img/') {
			ctx.set_content_type('image/png')
		} else {
			ctx.set_content_type('application/json')
		}
	}
	return ctx.text(data)
}

fn main() {
	mut app := App{}
	veb.run[App, Context](mut app, 49177)
}
